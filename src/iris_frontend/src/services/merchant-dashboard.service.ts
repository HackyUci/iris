import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import {
  type IMerchantDashboardService,
  type MerchantProfile,
  type MerchantBalance,
  type MerchantDashboard,
  type Invoice,
  type QRCodeData,
  type Currency,
  type ApiResult,
  type UIBalanceData,
  type UITransactionData,
  type UIDashboardData,
  type CurrencyCode
} from '../types/merchant.type';
import {
  BitcoinUtils,
  CurrencyUtils,
  TypeUtils,
  DateUtils,
  ApiUtils
} from '../lib/utils';

interface BackendService {
  get_merchant_profile: () => Promise<ApiResult<MerchantProfile>>;
  get_merchant_balance: () => Promise<ApiResult<MerchantBalance>>;
  get_merchant_dashboard: () => Promise<ApiResult<MerchantDashboard>>;
  get_my_invoices: () => Promise<ApiResult<Invoice[]>>;
  get_merchant_static_qr: () => Promise<ApiResult<QRCodeData>>;
  set_preferred_currency: (currency: Currency) => Promise<ApiResult<null>>;
}

class MerchantDashboardService implements IMerchantDashboardService {
  private actor: BackendService | null = null;
  private authClient: AuthClient | null = null;
  identity: null;

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
      this.actor = createActor(canisterId, { agent }) as BackendService;

    } catch (error) {
      console.error('Failed to initialize actor:', error);
      throw error;
    }
  }

  async getMerchantProfile(): Promise<MerchantProfile> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Actor not initialized');
    const result = await this.actor.get_merchant_profile();
    return ApiUtils.handleResult(result);
  }

  async getMerchantBalance(): Promise<MerchantBalance> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Actor not initialized');
    const result = await this.actor.get_merchant_balance();
    return ApiUtils.handleResult(result);
  }

  async getMerchantDashboard(): Promise<MerchantDashboard> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Actor not initialized');
    const result = await this.actor.get_merchant_dashboard();
    return ApiUtils.handleResult(result);
  }

  async getMerchantInvoices(): Promise<Invoice[]> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Actor not initialized');
    const result = await this.actor.get_my_invoices();
    return ApiUtils.handleResult(result);
  }

  async getStaticQR(): Promise<QRCodeData> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Actor not initialized');
    const result = await this.actor.get_merchant_static_qr();
    return ApiUtils.handleResult(result);
  }

  async setPreferredCurrency(currency: CurrencyCode): Promise<void> {
    await this.initializeActor();
    if (!this.actor) throw new Error('Actor not initialized');
    const currencyEnum = TypeUtils.createCurrencyEnum(currency);
    const result = await this.actor.set_preferred_currency(currencyEnum);
    ApiUtils.handleResult(result);
  }

  async getBalanceData(): Promise<UIBalanceData> {
    return ApiUtils.safeApiCall(
      async () => {
        const balance = await this.getMerchantBalance();
        const currency = TypeUtils.formatCurrency(balance.preferred_currency);
        
        return {
          btcBalance: BitcoinUtils.satoshiToBTC(balance.total_satoshi),
          usdBalance: CurrencyUtils.satoshiToFiat(balance.total_satoshi, 'USD'),
          fiatBalance: CurrencyUtils.satoshiToFiat(balance.total_satoshi, currency),
          currency
        };
      },
      {
        btcBalance: 0,
        usdBalance: 0,
        fiatBalance: 0,
        currency: 'USD'
      },
      'Error fetching balance'
    );
  }

  async getTransactionData(): Promise<UITransactionData[]> {
    return ApiUtils.safeApiCall(
      async () => {
        const invoices = await this.getMerchantInvoices();
        
        return invoices.map(invoice => {
          const currency = TypeUtils.formatCurrency(invoice.currency);
          const status = TypeUtils.formatPaymentStatus(invoice.status);
          
          return {
            id: invoice.id,
            description: invoice.description || 'Payment',
            amount: invoice.fiat_amount.toLocaleString(),
            currency: currency,
            btcAmount: BitcoinUtils.formatBTC(invoice.amount_satoshi),
            status: status,
            date: DateUtils.formatTransactionDate(invoice.created_at),
            time: DateUtils.formatTransactionTime(invoice.created_at)
          };
        }).reverse();
      },
      [],
      'Error fetching transactions'
    );
  }

  async getDashboardData(): Promise<UIDashboardData> {
    try {
      const [balance, transactions, profile, dashboard] = await Promise.allSettled([
        this.getBalanceData(),
        this.getTransactionData(),
        this.getMerchantProfile(),
        this.getMerchantDashboard()
      ]);

      return {
        balance: balance.status === 'fulfilled' ? balance.value : {
          btcBalance: 0,
          usdBalance: 0,
          fiatBalance: 0,
          currency: 'USD'
        },
        transactions: transactions.status === 'fulfilled' ? transactions.value : [],
        profile: profile.status === 'fulfilled' ? profile.value : null,
        dashboard: dashboard.status === 'fulfilled' ? dashboard.value : null
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
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
      'Error checking authentication'
    );
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.identity = null;
    this.actor = null;
  }
}

export const merchantDashboardService = new MerchantDashboardService();