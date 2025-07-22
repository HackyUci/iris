import { Principal } from '@dfinity/principal';

export type Currency = { USD: null } | { GBP: null } | { SGD: null } | { IDR: null };
export type PaymentStatus = { Pending: null } | { Confirmed: null } | { Completed: null } | { Failed: null };
export type UserRole = { Customer: null } | { Merchant: null };
export type PaymentMethod = 'Bitcoin' | 'Plug_Wallet' | 'Fiat_Payment';

export type ApiResult<T> = { Ok: T } | { Err: string };

export interface CustomerProfile {
  customer_principal: Principal;
  created_at: bigint;
  preferred_currency: Currency;
  total_payments: bigint;
}

export interface CustomerBalance {
  total_satoshi: bigint;
  usd_balance: number;
  last_updated: bigint;
}

export interface PaymentTransaction {
  id: string;
  invoice_id: string;
  customer_principal: Principal;
  merchant_name: string;
  amount_satoshi: bigint;
  fiat_amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  description?: string;
  created_at: bigint;
  updated_at: bigint;
}

export interface ScannedInvoice {
  id: string;
  merchant_name: string;
  merchant_id: string;
  bitcoin_address: string;
  fiat_amount: number;
  currency: Currency;
  amount_satoshi: bigint;
  description?: string;
  status: PaymentStatus;
  created_at: bigint;
}

export interface PaymentRequest {
  invoice_id: string;
  payment_method: PaymentMethod;
  usd_amount?: number; 
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface RegisterUserRequest {
  role: UserRole;
}
export interface UICustomerBalanceData {
  btcBalance: number;
  usdBalance: number;
}

export interface UICustomerTransactionData {
  id: string;
  description: string;
  merchantName: string;
  amount: string;
  currency: string;
  btcAmount: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Failed';
  paymentMethod: string;
  date: string;
  time: string;
}

export interface UICustomerDashboardData {
  balance: UICustomerBalanceData;
  transactions: UICustomerTransactionData[];
  profile: CustomerProfile | null;
}

export interface UIScannedInvoiceData {
  invoiceId: string;
  merchantName: string;
  amount: number;
  currency: string;
  btcAmount: number;
  description?: string;
  bitcoinAddress: string;
}

export interface UIPaymentMethodData {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface ScanToPayProps {
  btcBalance: number;
  usdBalance: number;
  onScanToPay?: () => void;
}

export interface CustomerTransactionCardProps {
  transactions: UICustomerTransactionData[];
  onViewAll?: () => void;
}

export interface ICustomerService {
  getCustomerProfile(): Promise<CustomerProfile>;
  getCustomerBalance(): Promise<CustomerBalance>;
  getPaymentHistory(): Promise<PaymentTransaction[]>;
  scanInvoiceQR(qrData: string): Promise<ScannedInvoice>;
  getPaymentMethods(): Promise<PaymentMethodOption[]>;
  makePayment(request: PaymentRequest): Promise<PaymentTransaction>;
  getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number>;
  convertUSDToBTC(usdAmount: number): Promise<number>;
  
  getBalanceData(): Promise<UICustomerBalanceData>;
  getTransactionData(): Promise<UICustomerTransactionData[]>;
  getDashboardData(): Promise<UICustomerDashboardData>;
  isAuthenticated(): Promise<boolean>;
}

export const PAYMENT_METHODS: PaymentMethod[] = ['Bitcoin', 'Plug_Wallet', 'Fiat_Payment'];
export const CURRENCIES = ['USD', 'GBP', 'SGD', 'IDR'] as const;
export type CurrencyCode = typeof CURRENCIES[number];

export const PAYMENT_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Failed'] as const;
export type PaymentStatusCode = typeof PAYMENT_STATUSES[number];

export type CurrencySymbol = '$' | '£' | 'S$' | 'Rp';
export type ExchangeRates = Record<CurrencyCode, number>;

export const MOCK_CUSTOMER_DASHBOARD_DATA: UICustomerDashboardData = {
  balance: {
    btcBalance: 0.0234,
    usdBalance: 1250.50
  },
  transactions: [
    {
      id: 'TXN-001',
      description: 'Coffee + Donut',
      merchantName: 'QRIS Coffee Shop',
      amount: '25,000',
      currency: 'IDR',
      btcAmount: '0.00019',
      status: 'Completed',
      paymentMethod: 'USD',
      date: '22 July 2025',
      time: '14:30'
    },
    {
      id: 'TXN-002', 
      description: 'Lunch at Restaurant',
      merchantName: 'Warung Padang',
      amount: '45,000',
      currency: 'IDR',
      btcAmount: '0.00034',
      status: 'Completed',
      paymentMethod: 'Plug_Wallet',
      date: '21 July 2025',
      time: '12:15'
    },
    {
      id: 'TXN-003',
      description: 'Book Purchase',
      merchantName: 'Gramedia',
      amount: '150,000',
      currency: 'IDR', 
      btcAmount: '0.00114',
      status: 'Pending',
      paymentMethod: 'External_Wallet',
      date: '21 July 2025',
      time: '10:45'
    }
  ],
  profile: null
};