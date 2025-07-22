import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import type { MerchantProfile, CreateMerchantRequest, ApiResult } from '../types/merchant.type';

interface BackendMerchantService {
  register_merchant: (request: CreateMerchantRequest) => Promise<ApiResult<MerchantProfile>>;
  get_merchant_profile: () => Promise<ApiResult<MerchantProfile>>;
}

class MerchantService {
  private actor: BackendMerchantService | null = null;
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

      const canisterId = process.env.CANISTER_ID_IRIS_BACKEND;
      if (!canisterId) {
        throw new Error('Backend canister ID not found in environment variables');
      }

      // Use the same import pattern as your existing services
      const { createActor } = await import('../declarations/iris_backend');
      this.actor = createActor(canisterId, { agent }) as BackendMerchantService;

    } catch (error) {
      console.error('Failed to initialize merchant service actor:', error);
      throw error;
    }
  }

  async registerMerchant(businessName: string): Promise<MerchantProfile> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Merchant service actor not initialized');
    
    const request: CreateMerchantRequest = { 
      business_name: businessName 
    };
    
    console.log('Calling register_merchant with:', request);
    const result = await this.actor.register_merchant(request);
    
    if ('Ok' in result) {
      console.log('Merchant registered successfully:', result.Ok);
      return result.Ok;
    } else {
      throw new Error(result.Err || 'Failed to register merchant');
    }
  }

  async getMerchantProfile(): Promise<MerchantProfile> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Merchant service actor not initialized');
    
    const result = await this.actor.get_merchant_profile();
    
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err || 'Failed to get merchant profile');
    }
  }

  async checkMerchantExists(): Promise<boolean> {
    try {
      await this.getMerchantProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.authClient) {
        this.authClient = await AuthClient.create();
      }
      return await this.authClient.isAuthenticated();
    } catch (error) {
      console.error('Error checking authentication in merchant service:', error);
      return false;
    }
  }
}

export const merchantService = new MerchantService();