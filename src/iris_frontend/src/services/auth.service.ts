import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { createActor } from '../declarations/index.js';
import { UserProfile } from '../types/user.type.js';

class AuthService {
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private identity: Identity | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('Initializing AuthClient...');
      this.authClient = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30,
          disableDefaultIdleCallback: true,
        },
      });
      
      console.log('AuthClient created successfully');
      
      if (await this.authClient.isAuthenticated()) {
        console.log('User already authenticated');
        this.identity = this.authClient.getIdentity();
        await this.createActor();
      }
    } catch (error) {
      console.error('Failed to initialize AuthClient:', error);
      throw error;
    }
  }

  private async createActor(): Promise<void> {
    try {
      const host = process.env.DFX_NETWORK === "local" 
        ? "http://localhost:4943" 
        : "https://ic0.app";
      
      if (!process.env.CANISTER_ID_IRIS_BACKEND) {
        throw new Error('Backend canister ID not found');
      }

      this.actor = createActor(process.env.CANISTER_ID_IRIS_BACKEND, {
        agentOptions: {
          identity: this.identity,
          host: host,
        },
      });
      
      console.log('Actor created successfully with host:', host);
    } catch (error) {
      console.error('Failed to create actor:', error);
      throw error;
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      await this.init();
    }

    if (!this.authClient) {
      throw new Error('AuthClient failed to initialize');
    }

    return new Promise((resolve, reject) => {
      const iiCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
      
      if (!iiCanisterId) {
        reject(new Error('Internet Identity canister ID not found'));
        return;
      }

      const identityProvider = process.env.DFX_NETWORK === "local"
        ? `http://${iiCanisterId}.localhost:4943/`
        : `https://${iiCanisterId}.ic0.app/`;
      
      console.log('Connecting to Internet Identity:', identityProvider);
      
      this.authClient.login({
        identityProvider,
        windowOpenerFeatures: 
          `left=${window.screen.width / 2 - 525 / 2}, ` +
          `top=${window.screen.height / 2 - 705 / 2},` +
          `toolbar=0,location=0,menubar=0,width=525,height=705`,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        onSuccess: async () => {
          try {
            console.log('Internet Identity login successful!');
            this.identity = this.authClient!.getIdentity();
            await this.createActor();
            resolve(true);
          } catch (error) {
            console.error('Failed to create actor after login:', error);
            reject(error);
          }
        },
        onError: (error) => {
          console.error('Internet Identity login failed:', error);
          reject(error);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.identity = null;
    this.actor = null;
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      return false;
    }
    return this.authClient.isAuthenticated();
  }

  getActor(): any {
    if (!this.actor) {
      throw new Error('Actor not initialized. Please login first.');
    }
    return this.actor;
  }

  getPrincipal() {
    return this.identity?.getPrincipal();
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const actor = this.getActor();
      console.log('Calling get_user_profile...');
      const result = await actor.get_user_profile();
      
      console.log('get_user_profile raw result:', result);
      
      if (result && typeof result === 'object' && 'Ok' in result) {
        const profile = result.Ok;
        console.log('Profile data:', profile);
        
        let role: 'Customer' | 'Merchant';
        if (profile.role.Customer !== undefined) {
          role = 'Customer';
        } else if (profile.role.Merchant !== undefined) {
          role = 'Merchant';
        } else {
          console.error('Unknown role format:', profile.role);
          return null;
        }
        
        return {
          role: role,
          user_principal: profile.user_principal,
          created_at: profile.created_at
        };
      } else {
        console.log('get_user_profile returned Err:', result?.Err);
        return null;
      }
    } catch (error) {
      console.log('getUserProfile error:', error);
      return null;
    }
  }

  async registerUser(role: 'Customer' | 'Merchant'): Promise<UserProfile> {
    const actor = this.getActor();
    
    const request = {
      role: { [role]: null }
    };

    console.log('Calling register_user with:', request);
    const result: any = await actor.register_user(request);
    
    if ('Ok' in result) {
      return {
        role: role,
        user_principal: result.Ok.user_principal,
        created_at: result.Ok.created_at
      };
    } else {
      throw new Error(result.Err || 'Registration failed');
    }
  }
}

export const authService = new AuthService();