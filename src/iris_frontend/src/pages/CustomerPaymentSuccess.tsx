import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import SuccessAnimation from "../components/SuccessAnimation";
import PaymentSummary from "../components/PaymentSummary";

interface PaymentSuccessData {
  transactionId: string;
  amount: number;
  currency: string;
  btcAmount: number;
  merchantName: string;
  paymentMethod: string;
  status: string;
  timestamp: number;
}

const CustomerPaymentSuccess: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    try {
      const storedPaymentResult = sessionStorage.getItem("paymentResult");
      if (storedPaymentResult) {
        const parsedData = JSON.parse(storedPaymentResult);
        setPaymentData(parsedData);
        sessionStorage.removeItem("paymentResult");
        sessionStorage.removeItem("scannedQRData");
      } else {
        setPaymentData({
          transactionId: "TXN-DEMO-" + Date.now(),
          amount: 25.0,
          currency: "USD",
          btcAmount: 0.00056,
          merchantName: "Demo Coffee Shop",
          paymentMethod: "USD Payment",
          status: "Completed",
          timestamp: Date.now(),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading payment data:", error);
      setPaymentData({
        transactionId: "TXN-ERROR-" + Date.now(),
        amount: 0,
        currency: "USD",
        btcAmount: 0,
        merchantName: "Unknown Merchant",
        paymentMethod: "Unknown",
        status: "Error",
        timestamp: Date.now(),
      });
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleViewDetails = () => {
    console.log("Navigate to transaction details");
  };

  const formatAmount = (amount: number, currency: string): string => {
    const symbols = {
      USD: "$",
      GBP: "£",
      SGD: "S$",
      IDR: "Rp",
    };

    const symbol = symbols[currency as keyof typeof symbols] || currency;

    if (currency === "IDR") {
      return `${symbol}${amount.toLocaleString("id-ID")}`;
    }

    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            amount={formatAmount(paymentData.amount, paymentData.currency)}
            currency={paymentData.currency}
            merchantName={paymentData.merchantName}
            transactionId={paymentData.transactionId}
            date={formatDate(paymentData.timestamp)}
            paymentMethod={paymentData.paymentMethod}
          />
        )}

        {paymentData && paymentData.btcAmount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-blue-800 font-medium mb-1">Bitcoin Amount</h3>
              <p className="text-lg font-semibold text-blue-900">
                {paymentData.btcAmount.toFixed(8)} BTC
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Equivalent amount paid to merchant
              </p>
            </div>
          </div>
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
                The merchant has been notified and will process your order
                shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentSuccess;
