import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { 
  type QRCodeData, 
  type MerchantProfile,
  type ApiResult
} from '../types/merchant.type';
import { ApiUtils } from '../lib/utils';

interface BackendQRService {
  get_merchant_profile: () => Promise<ApiResult<MerchantProfile>>;
  get_merchant_static_qr: () => Promise<ApiResult<QRCodeData>>;
  generate_invoice_qr: (invoiceId: string) => Promise<ApiResult<QRCodeData>>;
}

class QRService {
  private actor: BackendQRService | null = null;
  private authClient: AuthClient | null = null;

  private async initializeActor(): Promise<void> {
    if (this.actor) return;

    try {
      this.authClient = await AuthClient.create();
      
      const identity = this.authClient.getIdentity();
      const host = process.env.DFX_NETWORK === "local" 
        ? "http://localhost:4943" 
        : "https://ic0.app";

      const agent = new HttpAgent({
        identity,
        host,
      });

      if (process.env.DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
      }

      const canisterId = process.env.CANISTER_ID_IRIS_BACKEND || process.env.REACT_APP_CANISTER_ID_IRIS_BACKEND;
      if (!canisterId) {
        throw new Error('Backend canister ID not found in environment variables');
      }

      const { createActor } = await import('../declarations/iris_backend');
      this.actor = createActor(canisterId, { agent }) as BackendQRService;

    } catch (error) {
      console.error('Failed to initialize QR service actor:', error);
      throw error;
    }
  }

  async getMerchantProfile(): Promise<MerchantProfile> {
    await this.initializeActor();
    if (!this.actor) throw new Error('QR Service actor not initialized');
    const result = await this.actor.get_merchant_profile();
    return ApiUtils.handleResult(result);
  }

  async getStaticQR(): Promise<QRCodeData> {
    await this.initializeActor();
    if (!this.actor) throw new Error('QR Service actor not initialized');
    const result = await this.actor.get_merchant_static_qr();
    return ApiUtils.handleResult(result);
  }

  async generateInvoiceQR(invoiceId: string): Promise<QRCodeData> {
    await this.initializeActor();
    if (!this.actor) throw new Error('QR Service actor not initialized');
    const result = await this.actor.generate_invoice_qr(invoiceId);
    return ApiUtils.handleResult(result);
  }

  async isAuthenticated(): Promise<boolean> {
    return ApiUtils.safeApiCall(
      async () => {
        if (!this.authClient) {
          this.authClient = await AuthClient.create();
        }
        return await this.authClient.isAuthenticated();
      },
      false,
      'Error checking authentication in QR service'
    );
  }

  async getMerchantQRData(): Promise<{ profile: MerchantProfile; qrData: QRCodeData }> {
    return ApiUtils.safeApiCall(
      async () => {
        const [profile, qrData] = await Promise.all([
          this.getMerchantProfile(),
          this.getStaticQR()
        ]);
        
        return { profile, qrData };
      },
      { profile: null, qrData: null } as any,
      'Error fetching merchant QR data'
    );
  }
}

export const qrService = new QRService();