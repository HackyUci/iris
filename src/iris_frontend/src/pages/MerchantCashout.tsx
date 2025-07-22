import React, { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  Banknote,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { merchantDashboardService } from "../services/merchant-dashboard.service";

const MerchantCashout = () => {
  const [balance, setBalance] = useState(null);
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    bankDetails: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadCashoutData();
  }, []);

  const loadCashoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await merchantDashboardService.isAuthenticated();
      if (!isAuth) {
        setError("Please login to view cashout information");
        return;
      }

      const [balanceData, requestsData] = await Promise.allSettled([
        merchantDashboardService.getMerchantBalance(),
        getCashoutRequests(),
      ]);

      if (balanceData.status === "fulfilled") {
        setBalance(balanceData.value);
      } else {
        console.error("Failed to load balance:", balanceData.reason);
      }

      if (requestsData.status === "fulfilled") {
        setCashoutRequests(requestsData.value);
      } else {
        console.error("Failed to load cashout requests:", requestsData.reason);
      }
    } catch (err) {
      console.error("Error loading cashout data:", err);
      setError("Failed to load cashout data");
    } finally {
      setLoading(false);
    }
  };

  const getCashoutRequests = async () => {
    const actor = await getActor();
    const result = await actor.get_my_cashout_requests();

    if ("Ok" in result) {
      return result.Ok.sort(
        (a, b) => Number(b.created_at) - Number(a.created_at)
      );
    } else {
      throw new Error(result.Err || "Failed to get cashout requests");
    }
  };

  const getActor = async () => {
    const { authService } = await import("../services/auth.service");
    return authService.getActor();
  };

  const handleCreateCashout = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const requestedSatoshi = Math.floor(
      parseFloat(formData.amount) * 100000000
    ); 
    const availableSatoshi = balance?.confirmed_satoshi || 0;

    if (requestedSatoshi > Number(availableSatoshi)) {
      alert("Insufficient confirmed balance for this cashout");
      return;
    }

    try {
      setCreateLoading(true);

      const actor = await getActor();
      const request = {
        amount_satoshi: requestedSatoshi,
        target_currency: { [formData.currency]: null },
        bank_details: formData.bankDetails || null,
      };

      console.log("Creating cashout request:", request);
      const result = await actor.create_cashout_request(request);

      if ("Ok" in result) {
        console.log("Cashout request created:", result.Ok);
        setShowCreateForm(false);
        setFormData({ amount: "", currency: "USD", bankDetails: "" });
        await loadCashoutData(); 
      } else {
        throw new Error(result.Err || "Failed to create cashout request");
      }
    } catch (err) {
      console.error("Failed to create cashout:", err);
      alert(`Failed to create cashout: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const formatSatoshi = (satoshi) => {
    if (!satoshi) return "0.00000000";
    return (Number(satoshi) / 100000000).toFixed(8);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (currencyVariant) => {
    if (!currencyVariant) return "USD";
    return Object.keys(currencyVariant)[0];
  };

  const getStatusFromVariant = (statusVariant) => {
    if (!statusVariant) return "Pending";
    if (statusVariant.Pending !== undefined) return "Pending";
    if (statusVariant.Processing !== undefined) return "Processing";
    if (statusVariant.Completed !== undefined) return "Completed";
    if (statusVariant.Failed !== undefined) return "Failed";
    return "Pending";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={16} className="text-orange-500" />;
      case "Processing":
        return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      case "Completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "Failed":
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses =
      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "Processing":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cashout information...</p>
        </div>
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-red-500 mb-4">
            <DollarSign size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCashoutData}
            className="bg-bitcoin text-white px-6 py-2 rounded-lg hover:bg-bitcoin/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cash Out</h1>
            <p className="text-sm text-gray-500">
              Convert Bitcoin to fiat currency
            </p>
          </div>
          <button
            onClick={loadCashoutData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && balance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-yellow-800 text-sm">{error}</span>
            <button
              onClick={loadCashoutData}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Balance
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-xl font-bold text-green-700 mb-1">
                ₿{formatSatoshi(balance?.confirmed_satoshi)}
              </div>
              <div className="text-sm text-green-600">Confirmed</div>
              <div className="text-xs text-gray-500">Available for cashout</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-xl font-bold text-yellow-700 mb-1">
                ₿{formatSatoshi(balance?.pending_satoshi)}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
              <div className="text-xs text-gray-500">Not yet confirmed</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={
              !balance?.confirmed_satoshi ||
              Number(balance.confirmed_satoshi) === 0
            }
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center ${
              !balance?.confirmed_satoshi ||
              Number(balance.confirmed_satoshi) === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-bitcoin text-white hover:bg-bitcoin/90"
            }`}
          >
            <Plus size={20} className="mr-2" />
            New Cashout Request
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cashout History
          </h2>

          {cashoutRequests.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No cashout requests yet</p>
              <p className="text-gray-400 text-sm">
                Your cashout history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cashoutRequests.map((request) => {
                const status = getStatusFromVariant(request.status);
                const currency = formatCurrency(request.target_currency);

                return (
                  <div
                    key={request.id}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-bitcoin/10 rounded-full flex items-center justify-center mr-3">
                          <ArrowUpRight size={20} className="text-bitcoin" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.fiat_amount.toFixed(2)} {currency}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₿{formatSatoshi(request.amount_satoshi)}
                          </p>
                        </div>
                      </div>
                      <div className={getStatusBadgeClass(status)}>
                        {getStatusIcon(status)}
                        {status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>ID: {request.id}</span>
                      <span>{formatDate(request.created_at)}</span>
                    </div>

                    {request.bank_details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        Bank: {request.bank_details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Cashout Request
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (BTC)
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    max={formatSatoshi(balance?.confirmed_satoshi)}
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00000000"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: ₿{formatSatoshi(balance?.confirmed_satoshi)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Details (Optional)
                  </label>
                  <textarea
                    value={formData.bankDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, bankDetails: e.target.value })
                    }
                    placeholder="Bank name, account number, routing details..."
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCashout}
                    disabled={createLoading}
                    className="flex-1 bg-bitcoin text-white py-3 px-4 rounded-xl font-medium hover:bg-bitcoin/90 transition-colors disabled:opacity-50"
                  >
                    {createLoading ? "Creating..." : "Create Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantCashout;
