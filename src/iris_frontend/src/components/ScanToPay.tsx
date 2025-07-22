import React from 'react';
import { ScanToPayProps } from '../types/customer.type';

const ScanToPay: React.FC<ScanToPayProps> = ({ 
  btcBalance, 
  usdBalance, 
  onScanToPay
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold">IRIS</h2>
          <span className="text-sm font-medium opacity-90">Balance</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs opacity-80 mb-1">BTC</p>
          <p className="text-2xl font-bold">{btcBalance.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-xs opacity-80 mb-1">USD</p>
          <p className="text-2xl font-bold">${usdBalance.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={onScanToPay}
          className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <span className="text-lg font-semibold">Scan to Pay</span>
        </button>
      </div>
    </div>
  );
};

export default ScanToPay;