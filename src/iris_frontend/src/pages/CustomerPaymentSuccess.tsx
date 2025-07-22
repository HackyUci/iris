import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import SuccessAnimation from '../components/SuccessAnimation';
import PaymentSummary from '../components/PaymentSummary';

interface PaymentSuccessData {
  amount: string;
  currency: string;
  merchantName: string;
  transactionId: string;
  date: string;
  paymentMethod: string;
}

const CustomerPaymentSuccess: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    // In real implementation, this would come from route params or global state
    setTimeout(() => {
      setPaymentData({
        amount: '$97',
        currency: 'USD',
        merchantName: 'QRIS Coffee Shop',
        transactionId: 'TXN-000123',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        paymentMethod: 'USD Payment'
      });
      setLoading(false);
    }, 1000);
  };

  const handleBackToHome = () => {
    window.history.go(-3);
  };

  const handleViewDetails = () => {
    console.log('Navigate to transaction details');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={handleBackToHome}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 mx-auto">
            Payment Success
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <SuccessAnimation />

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">
            Your payment has been processed successfully
          </p>
        </div>

        {paymentData && (
          <PaymentSummary 
            amount={paymentData.amount}
            currency={paymentData.currency}
            merchantName={paymentData.merchantName}
            transactionId={paymentData.transactionId}
            date={paymentData.date}
            paymentMethod={paymentData.paymentMethod}
          />
        )}

        <div className="space-y-3 pt-4">
          <button
            onClick={handleViewDetails}
            className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Transaction Details
          </button>
          
          <button
            onClick={handleBackToHome}
            className="w-full px-4 py-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <p className="text-green-800 font-medium text-sm">
                Payment Confirmed
              </p>
              <p className="text-green-700 text-xs mt-1">
                The merchant has been notified and will process your order shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentSuccess;