import { Principal } from "@dfinity/principal";

export type ApiResult<T> = { Ok: T } | { Err: string };
export interface UserProfile {
  user_principal: Principal;
  role: "Customer" | "Merchant";
  created_at: bigint;
}

export type PaymentMethod =
  | { VirtualWallet: null }
  | { PlugWallet: null }
  | { MockUSD: null }
  | { ExternalWallet: null };

export interface MockUSDPaymentRequest {
  invoice_id: string;
  usd_amount: number;
}

export interface PaymentRequest {
  invoice_id: string;
  payment_method: PaymentMethod;
  amount?: number;
}

export interface CustomerTransaction {
  id: string;
  merchant_name: string;
  amount: number;
  currency: string;
  btc_amount: string;
  status: "Pending" | "Confirmed" | "Completed" | "Failed";
  date: string;
  time: string;
  payment_method: string;
}

export interface CustomerBalance {
  virtual_wallet_btc: number;
  virtual_wallet_usd: number;
  total_spent_btc: number;
  total_spent_usd: number;
}

export interface CustomerDashboardData {
  profile: UserProfile | null;
  balance: CustomerBalance;
  recent_transactions: CustomerTransaction[];
  payment_methods: PaymentMethod[];
}

export interface UICustomerProfile {
  principal_id: string;
  role: "Customer" | "Merchant";
  member_since: string;
  total_transactions: number;
}

export interface UIPaymentSummary {
  total_spent_btc: number;
  total_spent_usd: number;
  this_month_btc: number;
  this_month_usd: number;
  transaction_count: number;
}

export interface ScannedQRData {
  bitcoin_address: string;
  amount_satoshi?: number;
  label?: string;
  message?: string;
  is_valid: boolean;
}

export interface PaymentFormData {
  amount: string;
  payment_method: PaymentMethod;
  usd_amount?: number;
}

export interface IUserService {
  getUserProfile(): Promise<UserProfile>;
  registerUser(role: "Customer" | "Merchant"): Promise<UserProfile>;
  isAuthenticated(): Promise<boolean>;
  updateUserProfile?(data: Partial<UserProfile>): Promise<UserProfile>;
}

export interface ICustomerDashboardService {
  getCustomerProfile(): Promise<UserProfile>;
  getCustomerTransactions(): Promise<CustomerTransaction[]>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  makePayment(request: PaymentRequest): Promise<string>;
  simulateUSDPayment(request: MockUSDPaymentRequest): Promise<string>;
  simulatePlugWalletPayment(invoice_id: string): Promise<string>;
  simulateExternalWalletPayment(invoice_id: string): Promise<string>;
  getDashboardData(): Promise<CustomerDashboardData>;
  isAuthenticated(): Promise<boolean>;
}

export type CurrencyCode = "USD" | "EUR" | "GBP" | "SGD" | "IDR";
export type PaymentMethodType =
  | "VirtualWallet"
  | "PlugWallet"
  | "MockUSD"
  | "ExternalWallet";
