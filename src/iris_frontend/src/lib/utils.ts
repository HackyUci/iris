import type { Currency, PaymentStatus } from "../types/merchant.type";


export class BitcoinUtils {
  private static readonly SATOSHI_PER_BTC = 100_000_000;

  static satoshiToBTC(satoshi: bigint | number): number {
    const satoshiNum = typeof satoshi === 'bigint' ? Number(satoshi) : satoshi;
    return satoshiNum / this.SATOSHI_PER_BTC;
  }

  static btcToSatoshi(btc: number): bigint {
    return BigInt(Math.round(btc * this.SATOSHI_PER_BTC));
  }

  static formatBTC(satoshi: bigint | number, decimals: number = 8): string {
    const btc = this.satoshiToBTC(satoshi);
    return btc.toFixed(decimals);
  }

  static formatSatoshi(satoshi: bigint | number): string {
    const satoshiNum = typeof satoshi === 'bigint' ? Number(satoshi) : satoshi;
    return satoshiNum.toLocaleString();
  }
}

export class CurrencyUtils {
  private static readonly EXCHANGE_RATES: Record<string, number> = {
    USD: 95_000,
    GBP: 75_000,
    SGD: 128_000,
    IDR: 1_500_000_000
  };

  static getExchangeRate(currency: string): number {
    return this.EXCHANGE_RATES[currency.toUpperCase()] || this.EXCHANGE_RATES.USD;
  }

  static satoshiToFiat(satoshi: bigint | number, currency: string): number {
    const btcAmount = BitcoinUtils.satoshiToBTC(satoshi);
    const rate = this.getExchangeRate(currency);
    return btcAmount * rate;
  }

  static fiatToSatoshi(fiatAmount: number, currency: string): bigint {
    const rate = this.getExchangeRate(currency);
    const btcAmount = fiatAmount / rate;
    return BitcoinUtils.btcToSatoshi(btcAmount);
  }

  static formatFiat(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      GBP: '£',
      SGD: 'S$',
      IDR: 'Rp'
    };

    const symbol = symbols[currency.toUpperCase()] || currency;
    
    if (currency.toUpperCase() === 'IDR') {
      return `${symbol} ${Math.round(amount).toLocaleString('id-ID')}`;
    }
    
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}

export class TypeUtils {
  static formatCurrency(currency: Currency): string {
    if ('USD' in currency) return 'USD';
    if ('GBP' in currency) return 'GBP';
    if ('SGD' in currency) return 'SGD';
    if ('IDR' in currency) return 'IDR';
    return 'USD';
  }


  static createCurrencyEnum(currency: string): Currency {
    const currencyUpper = currency.toUpperCase();
    switch (currencyUpper) {
      case 'USD': return { USD: null };
      case 'GBP': return { GBP: null };
      case 'SGD': return { SGD: null };
      case 'IDR': return { IDR: null };
      default: return { USD: null };
    }
  }

  static formatPaymentStatus(status: PaymentStatus): 'Pending' | 'Confirmed' | 'Completed' | 'Failed' {
    if ('Pending' in status) return 'Pending';
    if ('Confirmed' in status) return 'Confirmed';
    if ('Completed' in status) return 'Completed';
    if ('Failed' in status) return 'Failed';
    return 'Pending';
  }

  static getStatusColorClass(status: 'Pending' | 'Confirmed' | 'Completed' | 'Failed'): string {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Pending':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
}

export class DateUtils {
  static icpTimestampToDate(timestamp: bigint | number): Date {
    const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(timestampNum / 1_000_000);
  }

  static formatTransactionDate(timestamp: bigint | number): string {
    const date = this.icpTimestampToDate(timestamp);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  static formatTransactionTime(timestamp: bigint | number): string {
    const date = this.icpTimestampToDate(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  static getRelativeTime(timestamp: bigint | number): string {
    const date = this.icpTimestampToDate(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}

export class ApiUtils {
  static handleResult<T>(result: { Ok: T } | { Err: string }): T {
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error(result.Err);
    }
  }

  static async safeApiCall<T>(
    apiCall: () => Promise<T>, 
    fallback: T,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error(errorMessage || 'API call failed:', error);
      return fallback;
    }
  }
}

export class ValidationUtils {
  static isValidBitcoinAddress(address: string): boolean {
    return address.length >= 26 && address.length <= 62 && 
           (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1'));
  }

  static isValidFiatAmount(amount: number): boolean {
    return amount > 0 && amount <= 1_000_000 && Number.isFinite(amount);
  }

  static isValidSatoshiAmount(satoshi: number | bigint): boolean {
    const satoshiNum = typeof satoshi === 'bigint' ? Number(satoshi) : satoshi;
    return satoshiNum > 0 && satoshiNum <= 21_000_000 * 100_000_000;
  }
}

export class CommonUtils {
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}