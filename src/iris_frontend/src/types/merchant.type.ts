import { Principal } from '@dfinity/principal';

export type Currency = { USD: null } | { GBP: null } | { SGD: null } | { IDR: null };
export type PaymentStatus = { Pending: null } | { Confirmed: null } | { Completed: null } | { Failed: null };
export type UserRole = { Customer: null } | { Merchant: null };

export type ApiResult<T> = { Ok: T } | { Err: string };

export interface MerchantProfile {
  total_invoices: bigint;
  business_name: string;
  merchant_principal: Principal;
  created_at: bigint;
  static_bitcoin_address: string;
}

export interface MerchantBalance {
  total_satoshi: bigint;
  preferred_currency: Currency;
  last_updated: bigint;
  confirmed_satoshi: bigint;
  merchant_principal: Principal;
  pending_satoshi: bigint;
}

export interface MerchantDashboard {
  total_invoices: bigint;
  total_balance_satoshi: bigint;
  preferred_currency: Currency;
  completed_payments: bigint;
  total_balance_fiat: number;
  pending_payments: bigint;
}

export interface Invoice {
  id: string;
  status: PaymentStatus;
  updated_at: bigint;
  merchant_id: string;
  bitcoin_address: string;
  fiat_amount: number;
  description?: string;
  created_at: bigint;
  currency: Currency;
  amount_satoshi: bigint;
}

export interface QRCodeData {
  bitcoin_address: string;
  invoice_id: string;
  qr_code_svg: string;
  bitcoin_uri: string;
  amount_satoshi: bigint;
}

export interface UserProfile {
  user_principal: Principal;
  role: UserRole;
  created_at: bigint;
}

export interface CreateMerchantRequest {
  business_name: string;
}

export interface CreateInvoiceRequest {
  merchant_id: string;
  fiat_amount: number;
  currency: Currency;
  description?: string;
}

export interface RegisterUserRequest {
  role: UserRole;
}

export interface UIBalanceData {
  btcBalance: number;
  usdBalance: number;
  fiatBalance: number;
  currency: string;
}

export interface UITransactionData {
  id: string;
  description: string;
  amount: string;
  currency: string;
  btcAmount: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Failed';
  date: string;
  time: string;
}

export interface UIDashboardData {
  balance: UIBalanceData;
  transactions: UITransactionData[];
  profile: MerchantProfile | null;
  dashboard: MerchantDashboard | null;
}

export interface BalanceCardProps {
  btcBalance: number;
  usdBalance: number;
  onSeeMyQR?: () => void;
  onGenerate?: () => void;
  onHistory?: () => void;
  onCashOut?: () => void;
}

export interface TransactionCardProps {
  transactions: UITransactionData[];
  onViewAll?: () => void;
}

export interface IMerchantDashboardService {
  getMerchantProfile(): Promise<MerchantProfile>;
  getMerchantBalance(): Promise<MerchantBalance>;
  getMerchantDashboard(): Promise<MerchantDashboard>;
  getMerchantInvoices(): Promise<Invoice[]>;
  getStaticQR(): Promise<QRCodeData>;
  setPreferredCurrency(currency: 'USD' | 'GBP' | 'SGD' | 'IDR'): Promise<void>;
  getBalanceData(): Promise<UIBalanceData>;
  getTransactionData(): Promise<UITransactionData[]>;
  getDashboardData(): Promise<UIDashboardData>;
  isAuthenticated(): Promise<boolean>;
}

export const CURRENCIES = ['USD', 'GBP', 'SGD', 'IDR'] as const;
export type CurrencyCode = typeof CURRENCIES[number];

export const PAYMENT_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Failed'] as const;
export type PaymentStatusCode = typeof PAYMENT_STATUSES[number];

export type CurrencySymbol = '$' | '£' | 'S$' | 'Rp';
export type ExchangeRates = Record<CurrencyCode, number>;