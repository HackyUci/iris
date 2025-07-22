import React from 'react';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  currency: string;
  btcAmount: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Failed';
  date: string;
  time: string;
}

interface TransactionCardProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transactions, onViewAll }) => {
  const getStatusBadge = (status: Transaction['status']) => {
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
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No transactions yet</p>
            <p className="text-gray-400 text-xs mt-1">Your transactions will appear here</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-green-600">
                      +{transaction.currency} {transaction.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      BTC {transaction.btcAmount}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                    <p className="text-xs text-gray-400">{transaction.time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {transactions.length > 0 && (
        <div className="mt-4 text-center">
          <button 
            onClick={onViewAll}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;