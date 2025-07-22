import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "../components/BalanceCard";
import TransactionCard from "../components/TransactionCard";
import { merchantDashboardService } from "../services/merchant-dashboard.service";
import type { UIDashboardData } from "../types/merchant.type";

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<UIDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const isAuth = await merchantDashboardService.isAuthenticated();
        if (!isAuth) {
          setError("Please login to view dashboard");
          return;
        }
        const data = await merchantDashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    const loadData = async () => {
      try {
        const data = await merchantDashboardService.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (error) {
        setError("Failed to refresh data");
      }
    };

    await loadData();
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

        <BalanceCard
          btcBalance={balance.btcBalance}
          usdBalance={balance.usdBalance}
          onSeeMyQR={() => console.log("See My QR clicked")}
          onHistory={() => navigate("/merchant-history")}
          onCashOut={() => console.log("Cash Out clicked")}
        />

        <TransactionCard
          transactions={transactions}
          onViewAll={() => console.log("View All clicked")}
        />
      </div>
    </div>
  );
};

export default MerchantDashboard;
