import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import type {
  UserProfile,
  PaymentMethod,
  MockUSDPaymentRequest,
  ApiResult,
} from "../types/user.type";

interface BackendCustomerService {
  get_user_profile: () => Promise<ApiResult<UserProfile>>;
  get_payment_methods: () => Promise<PaymentMethod[]>;
  simulate_usd_payment: (
    request: MockUSDPaymentRequest
  ) => Promise<ApiResult<string>>;
  simulate_plug_wallet_payment: (
    invoice_id: string
  ) => Promise<ApiResult<string>>;
  simulate_external_wallet_payment: (
    invoice_id: string
  ) => Promise<ApiResult<string>>;
  get_usd_to_btc_rate: () => Promise<number>;
  convert_usd_to_satoshi: (usd_amount: number) => Promise<bigint>;
  get_invoice_by_qr_scan: (invoice_id: string) => Promise<ApiResult<any>>;
}

class CustomerService {
  private actor: BackendCustomerService | null = null;
  private authClient: AuthClient | null = null;
  identity: null;

  private async initializeActor(): Promise<void> {
    if (this.actor) return;

    try {
      this.authClient = await AuthClient.create();

      const identity = this.authClient.getIdentity();
      const host =
        process.env.DFX_NETWORK === "local"
          ? "http://localhost:4943"
          : "https://ic0.app";

      const agent = new HttpAgent({
        identity,
        host,
      });

      if (process.env.DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
      }

      const canisterId = process.env.CANISTER_ID_IRIS_BACKEND;
      if (!canisterId) {
        throw new Error(
          "Backend canister ID not found in environment variables"
        );
      }

      const { createActor } = await import("../declarations/iris_backend");
      this.actor = createActor(canisterId, { agent }) as BackendCustomerService;
    } catch (error) {
      console.error("Failed to initialize customer service actor:", error);
      throw error;
    }
  }

  async getCustomerProfile(): Promise<UserProfile> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    const result = await this.actor.get_user_profile();

    if ("Ok" in result) {
      const userProfile = result.Ok;
      console.log("Raw user profile from backend:", userProfile);

      let userRole: string;
      if (typeof userProfile.role === "string") {
        userRole = userProfile.role;
      } else if (
        typeof userProfile.role === "object" &&
        userProfile.role !== null
      ) {
        userRole = Object.keys(userProfile.role)[0];
      } else {
        console.error("Unexpected role format:", userProfile.role);
        throw new Error("Invalid user role format");
      }

      console.log("Parsed user role:", userRole);

      if (userRole !== "Customer") {
        throw new Error(`User is not a customer. User role: ${userRole}`);
      }

      return userProfile;
    } else {
      throw new Error(result.Err || "Failed to get user profile");
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    try {
      const methods = await this.actor.get_payment_methods();
      return methods;
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return [
        { VirtualWallet: null },
        { PlugWallet: null },
        { MockUSD: null },
        { ExternalWallet: null },
      ];
    }
  }

  async simulateUSDPayment(request: MockUSDPaymentRequest): Promise<string> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");
    const result = await this.actor.simulate_usd_payment(request);
    if ("Ok" in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err || "USD payment failed");
    }
  }

  async simulatePlugWalletPayment(invoice_id: string): Promise<string> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    const result = await this.actor.simulate_plug_wallet_payment(invoice_id);

    if ("Ok" in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err || "Plug wallet payment failed");
    }
  }

  async simulateExternalWalletPayment(invoice_id: string): Promise<string> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    const result = await this.actor.simulate_external_wallet_payment(
      invoice_id
    );

    if ("Ok" in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err || "External wallet payment failed");
    }
  }

  async getBTCRate(): Promise<number> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    try {
      return await this.actor.get_usd_to_btc_rate();
    } catch (error) {
      console.error("Error getting BTC rate:", error);
      return 45000;
    }
  }

  async convertUSDToSatoshi(usd_amount: number): Promise<number> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    try {
      const satoshi = await this.actor.convert_usd_to_satoshi(usd_amount);
      return Number(satoshi);
    } catch (error) {
      const btc_rate = await this.getBTCRate();
      const btc_amount = usd_amount / btc_rate;
      return Math.floor(btc_amount * 100000000);
    }
  }

  async getInvoiceByQRScan(invoice_id: string): Promise<any> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Customer service actor not initialized");

    const result = await this.actor.get_invoice_by_qr_scan(invoice_id);

    if ("Ok" in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err || "Invoice not found");
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.authClient) {
        this.authClient = await AuthClient.create();
      }
      return await this.authClient.isAuthenticated();
    } catch (error) {
      console.error(
        "Error checking authentication in customer service:",
        error
      );
      return false;
    }
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.identity = null;
    this.actor = null;
  }

  formatPaymentMethod(method: PaymentMethod): string {
    if ("VirtualWallet" in method) return "Virtual Wallet";
    if ("PlugWallet" in method) return "Plug Wallet";
    if ("MockUSD" in method) return "USD (Mock)";
    if ("ExternalWallet" in method) return "External Wallet";
    return "Unknown";
  }

  formatSatoshi(satoshi: number): string {
    return (satoshi / 100000000).toFixed(8);
  }
}

export const customerService = new CustomerService();
