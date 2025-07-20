import { AuthClient } from '@dfinity/auth-client';
import { createActor } from './declarations';

class AuthService {
  constructor() {
    this.authClient = null;
    this.actor = null;
    this.identity = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  async _initialize() {
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

  async createActor() {
    try {
      const host = process.env.DFX_NETWORK === "local" ? "http://localhost:4943" : "https://ic0.app";
      
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

  async login() {
    if (!this.authClient) {
      await this.init();
    }

    if (!this.authClient) {
      throw new Error('AuthClient failed to initialize');
    }

    return new Promise((resolve, reject) => {
      const iiCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
      
      if (!iiCanisterId) {
        reject(new Error('Internet Identity canister ID not found in environment'));
        return;
      }

      const identityProvider = `http://${iiCanisterId}.localhost:4943/`;
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
            this.identity = this.authClient.getIdentity();
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

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.identity = null;
    this.actor = null;
  }

  isAuthenticated() {
    return this.authClient?.isAuthenticated() || false;
  }

  getActor() {
    return this.actor;
  }

  getPrincipal() {
    return this.identity?.getPrincipal();
  }
}

export const authService = new AuthService();