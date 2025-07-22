import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { customerService } from '../services/customer.service';
import MerchantInfo from '../components/MerchantInfo';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import type { UIPaymentMethodData, PaymentMethod } from '../types/customer.type';
import { useNavigate } from 'react-router-dom';

interface StaticQRData {
  merchantName: string;
  merchantId: string;
  bitcoinAddress: string;
}

const CustomerScanStatic: React.FC = () => {
  const [merchantData, setMerchantData] = useState<StaticQRData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<UIPaymentMethodData[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadStaticQRData();
    loadPaymentMethods();
  }, []);

  const loadStaticQRData = async () => {
    try {
      // Simulasi QR scan
      setMerchantData({
        merchantName: 'QRIS Coffee Shop',
        merchantId: 'coffee-shop',
        bitcoinAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      });
    } catch (err) {
      console.error('Error loading static QR data:', err);
      setError('Failed to load merchant information');
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await customerService.getPaymentMethods();
      const uiMethods: UIPaymentMethodData[] = methods.map(method => {
        if ('MockUSD' in method) {
          return {
            id: 'Fiat_Payment',
            name: 'USD Payment',
            description: 'Pay with US Dollars',
            icon: '$',
            available: true
          };
        }
        if ('PlugWallet' in method) {
          return {
            id: 'Plug_Wallet',
            name: 'Plug Wallet',
            description: 'Connect your Plug wallet',
            icon: '🔌',
            available: true
          };
        }
        if ('ExternalWallet' in method) {
          return {
            id: 'Bitcoin',
            name: 'Bitcoin Wallet',
            description: 'Use external Bitcoin wallet',
            icon: '₿',
            available: true
          };
        }
      });

      setPaymentMethods(uiMethods);
      setLoading(false);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setError('Failed to load payment methods');
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleContinue = () => {
    if (!selectedPaymentMethod || !merchantData) {
      setError('Please select a payment method');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    console.log('Continuing with:', {
      merchant: merchantData,
      paymentMethod: selectedPaymentMethod,
      amount
    });

    navigate('/customer-payment-success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading merchant information...</p>
        </div>
      </div>
    );
  }

  if (error && !merchantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-2xl">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 mx-auto">
            Static QR Scanned
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {merchantData && (
          <MerchantInfo 
            merchantName={merchantData.merchantName}
            merchantId={merchantData.merchantId}
            bitcoinAddress={merchantData.bitcoinAddress}
          />
        )}

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-lg">
              $
            </span>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
              min="0"
            />
          </div>
        </div>

        <PaymentMethodSelector
          paymentMethods={paymentMethods}
          selectedMethod={selectedPaymentMethod}
          onMethodSelect={handlePaymentMethodSelect}
        />

        <div className="pt-4">
          <button
            onClick={handleContinue}
            disabled={!selectedPaymentMethod}
            className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerScanStatic;
