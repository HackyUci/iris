import React from 'react';

interface BalanceCardProps {
  btcBalance: number;
  usdBalance: number;
  onSeeMyQR?: () => void;
  onGenerate?: () => void;
  onHistory?: () => void;
  onCashOut?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  btcBalance, 
  usdBalance, 
  onSeeMyQR,
  onGenerate,
  onHistory,
  onCashOut
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
      
      <div className="grid grid-cols-4 gap-4">
        <button 
          onClick={onSeeMyQR}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <span className="text-xs">See My QR</span>
        </button>
        
        <button 
          onClick={onGenerate}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="text-xs">Generate</span>
        </button>
        
        <button 
          onClick={onHistory}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="text-xs">History</span>
        </button>
        
        <button 
          onClick={onCashOut}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 10a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"/>
            </svg>
          </div>
          <span className="text-xs">Cash Out</span>
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;