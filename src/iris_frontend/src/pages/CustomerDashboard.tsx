import React, { useState, useEffect } from 'react';
import ScanToPay from '../components/ScanToPay';
import TransactionCard from '../components/TransactionCard';
import { MOCK_CUSTOMER_DASHBOARD_DATA } from '../types/customer.type';
import type { UICustomerDashboardData } from '../types/customer.type';

const CustomerDashboard = () => {
  const [dashboardData, setDashboardData] = useState<UICustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStaticData = () => {
      setTimeout(() => {
        setDashboardData(MOCK_CUSTOMER_DASHBOARD_DATA);
        setLoading(false);
      }, 1000); 
    };

    loadStaticData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setDashboardData(MOCK_CUSTOMER_DASHBOARD_DATA);
      setError(null);
      setLoading(false);
    }, 500);
  };

  const handleScanToPay = () => {
    console.log('Navigate to QR Scanner');
  };

  const handleViewAllTransactions = () => {
    console.log('Navigate to Transaction History');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const balance = dashboardData?.balance || { btcBalance: 0, usdBalance: 0 };
  const transactions = dashboardData?.transactions || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-yellow-800 text-sm">{error}</span>
            <button 
              onClick={handleRefresh}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        <ScanToPay 
          btcBalance={balance.btcBalance}
          usdBalance={balance.usdBalance}
          onScanToPay={handleScanToPay}
        />
        
        <TransactionCard 
          transactions={transactions}
          onViewAll={handleViewAllTransactions}
        />
      </div>
    </div>
  );
};

export default CustomerDashboard;