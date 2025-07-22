import React from 'react';
import { Store, Copy, Check } from 'lucide-react';

interface MerchantInfoProps {
  merchantName: string;
  merchantId: string;
  bitcoinAddress: string;
}

const MerchantInfo: React.FC<MerchantInfoProps> = ({
  merchantName,
  merchantId,
  bitcoinAddress
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(bitcoinAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store size={32} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {merchantName}
        </h2>
        <p className="text-gray-600 text-sm">
          Static QR Code Detected
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            Merchant Name
          </span>
          <span className="text-sm text-gray-900 font-medium">
            {merchantName}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            Merchant ID
          </span>
          <span className="text-sm text-gray-900 font-mono">
            {merchantId}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Bitcoin Address
            </span>
            <button
              onClick={handleCopyAddress}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="text-sm text-gray-900 font-mono break-all">
            <span className="block sm:hidden">
              {truncateAddress(bitcoinAddress)}
            </span>
            <span className="hidden sm:block">
              {bitcoinAddress}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm text-center">
          Select a payment method to continue with your transaction
        </p>
      </div>
    </div>
  );
};

export default MerchantInfo;