import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import type {
  MockUSDPaymentRequest,
  ApiResult,
} from "../types/user.type";

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  currency: "USD" | "GBP" | "SGD" | "IDR";
  paymentMethod: PaymentMethodType;
  bitcoinAddress?: string; 
}

export interface PaymentResult {
  transactionId: string;
  status: "Pending" | "Confirmed" | "Completed" | "Failed";
  amount: number;
  currency: string;
  btcAmount: number;
  merchantName?: string;
  paymentMethod: PaymentMethodType;
  timestamp: number;
}

export type PaymentMethodType =
  | "MockUSD"
  | "PlugWallet"
  | "ExternalWallet"
  | "VirtualWallet";

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
}

interface BackendPaymentService {
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
  get_all_currencies: () => Promise<any[]>;
  create_invoice: (request: any) => Promise<ApiResult<any>>;
  get_invoice_by_qr_scan: (invoice_id: string) => Promise<ApiResult<any>>;
}

class CustomerPaymentService {
  private actor: BackendPaymentService | null = null;
  private authClient: AuthClient | null = null;
  private exchangeRates = {
    USD: 1,
    GBP: 0.79,
    SGD: 1.35,
    IDR: 15700,
  };

  private async initializeActor(): Promise<void> {
    if (this.actor) return;

    try {
      this.authClient = await AuthClient.create();
      const identity = this.authClient.getIdentity();
      const host =
        process.env.DFX_NETWORK === "local"
          ? "http://localhost:4943"
          : "https://ic0.app";

      const agent = new HttpAgent({ identity, host });

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
      this.actor = createActor(canisterId, { agent }) as BackendPaymentService;
    } catch (error) {
      console.error("Failed to initialize payment service actor:", error);
      throw error;
    }
  }

  async getBTCRate(currency: string = "USD"): Promise<number> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Payment service actor not initialized");

    try {
      const usdRate = await this.actor.get_usd_to_btc_rate();

      if (currency === "USD") {
        return usdRate;
      }

      const currencyToUsd =
        this.exchangeRates[currency as keyof typeof this.exchangeRates];
      return usdRate * currencyToUsd;
    } catch (error) {
      console.error("Error getting BTC rate:", error);
      const fallbackRates = {
        USD: 45000,
        GBP: 57000,
        SGD: 33500,
        IDR: 2.9,
      };
      return fallbackRates[currency as keyof typeof fallbackRates] || 45000;
    }
  }

  async convertCurrencyToBTC(
    amount: number,
    currency: string
  ): Promise<CurrencyConversion> {
    const btcRate = await this.getBTCRate(currency);
    const btcAmount = amount / btcRate;

    return {
      fromCurrency: currency,
      toCurrency: "BTC",
      fromAmount: amount,
      toAmount: btcAmount,
      exchangeRate: btcRate,
    };
  }

  async convertCurrencyToSatoshi(
    amount: number,
    currency: string
  ): Promise<number> {
    const conversion = await this.convertCurrencyToBTC(amount, currency);
    return Math.floor(conversion.toAmount * 100000000); 
  }

  async createStaticInvoice(
    merchantId: string,
    amount: number,
    currency: string,
    bitcoinAddress: string
  ): Promise<string> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Payment service actor not initialized");

    try {
      const invoiceRequest = {
        merchant_id: merchantId,
        fiat_amount: amount,
        currency: this.mapCurrencyToBackend(currency),
        description: `Static QR Payment - ${amount} ${currency}`,
      };

      const result = await this.actor.create_invoice(invoiceRequest);

      if ("Ok" in result) {
        return result.Ok.id;
      } else {
        throw new Error(result.Err || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating static invoice:", error);
      return `STATIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    await this.initializeActor();
    if (!this.actor) throw new Error("Payment service actor not initialized");

    try {
      console.log("Processing payment:", request);

      let invoiceId = request.invoiceId;

      if (!invoiceId && request.bitcoinAddress) {
        invoiceId = await this.createStaticInvoice(
          "static-merchant",
          request.amount,
          request.currency,
          request.bitcoinAddress
        );
      }

      let result: ApiResult<string>;
      let paymentMethodName = "";

      switch (request.paymentMethod) {
        case "MockUSD":
          let usdAmount = request.amount;
          if (request.currency !== "USD") {
            const rate =
              this.exchangeRates[
                request.currency as keyof typeof this.exchangeRates
              ];
            usdAmount = request.amount / rate;
          }

          result = await this.actor.simulate_usd_payment({
            invoice_id: invoiceId,
            usd_amount: usdAmount,
          });
          paymentMethodName = `${request.currency} Payment`;
          break;

        case "PlugWallet":
          result = await this.actor.simulate_plug_wallet_payment(invoiceId);
          paymentMethodName = "Plug Wallet";
          break;

        case "ExternalWallet":
          result = await this.actor.simulate_external_wallet_payment(invoiceId);
          paymentMethodName = "External Wallet";
          break;

        default:
          throw new Error(
            `Unsupported payment method: ${request.paymentMethod}`
          );
      }

      if ("Ok" in result) {
        const conversion = await this.convertCurrencyToBTC(
          request.amount,
          request.currency
        );

        return {
          transactionId: `TXN-${Date.now()}`,
          status: "Completed", 
          amount: request.amount,
          currency: request.currency,
          btcAmount: conversion.toAmount,
          paymentMethod: request.paymentMethod,
          timestamp: Date.now(),
        };
      } else {
        throw new Error(result.Err || "Payment failed");
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      throw new Error(
        error instanceof Error ? error.message : "Payment failed"
      );
    }
  }

  async getAvailablePaymentMethods(): Promise<
    Array<{
      id: PaymentMethodType;
      name: string;
      description: string;
      icon: string;
      available: boolean;
      currencies: string[];
    }>
  > {
    return [
      {
        id: "MockUSD",
        name: "Fiat Payment",
        description: "Pay with USD, GBP, SGD, or IDR",
        icon: "💳",
        available: true,
        currencies: ["USD", "GBP", "SGD", "IDR"],
      },
      {
        id: "PlugWallet",
        name: "Plug Wallet",
        description: "Connect your Plug wallet",
        icon: "🔌",
        available: true,
        currencies: ["BTC"],
      },
      {
        id: "ExternalWallet",
        name: "External Bitcoin Wallet",
        description: "Use external Bitcoin wallet",
        icon: "₿",
        available: true,
        currencies: ["BTC"],
      },
    ];
  }

  getSupportedCurrencies(): Array<{
    code: string;
    name: string;
    symbol: string;
  }> {
    return [
      { code: "USD", name: "US Dollar", symbol: "$" },
      { code: "GBP", name: "British Pound", symbol: "£" },
      { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
      { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    ];
  }

  private mapCurrencyToBackend(currency: string): any {
    switch (currency) {
      case "USD":
        return { USD: null };
      case "GBP":
        return { GBP: null };
      case "SGD":
        return { SGD: null };
      case "IDR":
        return { IDR: null };
      default:
        return { USD: null };
    }
  }

  formatCurrencyAmount(amount: number, currency: string): string {
    const symbols = {
      USD: "$",
      GBP: "£",
      SGD: "S$",
      IDR: "Rp",
    };

    const symbol = symbols[currency as keyof typeof symbols] || currency;

    if (currency === "IDR") {
      return `${symbol}${amount.toLocaleString("id-ID")}`;
    }

    return `${symbol}${amount.toLocaleString()}`;
  }

  formatBTCAmount(satoshi: number): string {
    return (satoshi / 100000000).toFixed(8) + " BTC";
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.authClient) {
        this.authClient = await AuthClient.create();
      }
      return await this.authClient.isAuthenticated();
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }
}

export const customerPaymentService = new CustomerPaymentService();
