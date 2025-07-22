import React from 'react';
import { Receipt, Store, CreditCard, Calendar, Hash } from 'lucide-react';

interface PaymentSummaryProps {
  amount: string;
  currency: string;
  merchantName: string;
  transactionId: string;
  date: string;
  paymentMethod: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  amount,
  currency,
  merchantName,
  transactionId,
  date,
  paymentMethod
}) => {
  const getPaymentMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('usd')) {
      return '$';
    }
    if (method.toLowerCase().includes('plug')) {
      return '🔌';
    }
    if (method.toLowerCase().includes('bitcoin')) {
      return '₿';
    }
    return <CreditCard size={16} />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <Receipt size={24} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Receipt
          </h3>
          <p className="text-sm text-gray-600">
            Transaction Summary
          </p>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {amount}
        </div>
        <div className="text-sm text-gray-600">
          {currency} • Successfully Paid
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Store size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Merchant
            </span>
          </div>
          <span className="text-sm text-gray-900 font-medium">
            {merchantName}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {typeof getPaymentMethodIcon(paymentMethod) === 'string' ? (
              <span className="text-lg">{getPaymentMethodIcon(paymentMethod)}</span>
            ) : (
              getPaymentMethodIcon(paymentMethod)
            )}
            <span className="text-sm font-medium text-gray-700">
              Payment Method
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {paymentMethod}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Hash size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Transaction ID
            </span>
          </div>
          <span className="text-sm text-gray-900 font-mono">
            {transactionId}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Calendar size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Date & Time
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {date}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;