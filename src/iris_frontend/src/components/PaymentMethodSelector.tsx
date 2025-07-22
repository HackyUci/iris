import React from 'react';
import { Check } from 'lucide-react';
import type { UIPaymentMethodData, PaymentMethod } from '../types/customer.type';

interface PaymentMethodSelectorProps {
  paymentMethods: UIPaymentMethodData[];
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethod,
  onMethodSelect
}) => {
  const isSelected = (methodId: PaymentMethod) => {
    return selectedMethod === methodId;
  };

  const getMethodIcon = (icon: string) => {
    if (icon === '$' || icon === '₿' || icon === '?') {
      return <span className="text-2xl">{icon}</span>;
    }
    
    return <span className="text-lg font-bold text-gray-600">{icon}</span>;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choose Payment Method
      </h3>
      
      <div className="space-y-3">
       {paymentMethods.map((method) => {
        if (!method) return null; 
        const available = method.available ?? false; 

        return (
            <button
            key={method.id}
            onClick={() => available && onMethodSelect(method.id)}
            disabled={!available}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
                isSelected(method.id)
                ? 'border-blue-500 bg-blue-50'
                : available
                ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
            >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getMethodIcon(method.icon)}
                </div>
                <div className="text-left">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                </div>
                </div>

                {available ? (
                <div className="flex items-center">
                    {isSelected(method.id) ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                    </div>
                    ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                </div>
                ) : (
                <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Unavailable
                </div>
                )}
            </div>
            </button>
        );
        })}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No payment methods available</div>
          <div className="text-sm text-gray-400">
            Please try again later
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;