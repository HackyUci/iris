import { useState, useEffect } from "react";
import {
  Clock,
  Receipt,
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { merchantDashboardService } from "../services/merchant-dashboard.service";

const MerchantHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInvoiceHistory();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, filterStatus]);

  const loadInvoiceHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await merchantDashboardService.isAuthenticated();
      if (!isAuth) {
        setError("Please login to view your transaction history");
        return;
      }

      const invoiceData = await merchantDashboardService.getMerchantInvoices();
      console.log("Loaded invoices:", invoiceData);

      const sortedInvoices = invoiceData.sort(
        (a, b) => Number(b.created_at) - Number(a.created_at)
      );
      setInvoices(sortedInvoices);
    } catch (err) {
      console.error("Error loading invoice history:", err);
      setError("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.description &&
            invoice.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter((invoice) => {
        const status = getStatusFromVariant(invoice.status);
        return status === filterStatus;
      });
    }

    setFilteredInvoices(filtered);
  };

  const getStatusFromVariant = (statusVariant) => {
    if (!statusVariant) return "Pending";
    if (statusVariant.Pending !== undefined) return "Pending";
    if (statusVariant.Confirmed !== undefined) return "Confirmed";
    if (statusVariant.Completed !== undefined) return "Completed";
    if (statusVariant.Failed !== undefined) return "Failed";
    return "Pending";
  };

  const formatCurrency = (currencyVariant) => {
    if (!currencyVariant) return "USD";
    return Object.keys(currencyVariant)[0];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) / 1000000); 
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSatoshi = (satoshi) => {
    if (!satoshi) return "0.00000000";
    return (Number(satoshi) / 100000000).toFixed(8);
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "Confirmed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-red-500 mb-4">
            <Receipt size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadInvoiceHistory}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction History
            </h1>
            <p className="text-sm text-gray-500">
              {invoices.length} total transactions
            </p>
          </div>
          <button
            onClick={loadInvoiceHistory}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && invoices.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-yellow-800 text-sm">{error}</span>
            <button
              onClick={loadInvoiceHistory}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by ID or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-bitcoin focus:ring-1 focus:ring-bitcoin outline-none appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
              <Filter
                size={16}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No transactions found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm || filterStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Your transaction history will appear here"}
              </p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const status = getStatusFromVariant(invoice.status);
              const currency = formatCurrency(invoice.currency);

              return (
                <div
                  key={invoice.id}
                  onClick={() => handleInvoiceClick(invoice)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-bitcoin/10 rounded-full flex items-center justify-center mr-3">
                        <Receipt size={20} className="text-bitcoin" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {invoice.description ||
                                `Invoice ${invoice.id.slice(-6)}`}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {invoice.id.slice(0, 8)}...
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {invoice.fiat_amount} {currency}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₿{formatSatoshi(invoice.amount_satoshi)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatDate(invoice.created_at)} •{" "}
                            {formatTime(invoice.created_at)}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={getStatusBadgeClass(status)}>
                              {status}
                            </span>
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <span
                    className={getStatusBadgeClass(
                      getStatusFromVariant(selectedInvoice.status)
                    )}
                  >
                    {getStatusFromVariant(selectedInvoice.status)}
                  </span>
                </div>

                <div className="text-center py-4 border-b border-gray-100">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedInvoice.fiat_amount}{" "}
                    {formatCurrency(selectedInvoice.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    ₿{formatSatoshi(selectedInvoice.amount_satoshi)} BTC
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice ID</span>
                    <span className="font-mono text-sm text-gray-900">
                      {selectedInvoice.id}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Description</span>
                    <span className="text-gray-900">
                      {selectedInvoice.description || "No description"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">
                      {formatDate(selectedInvoice.created_at)}{" "}
                      {formatTime(selectedInvoice.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated</span>
                    <span className="text-gray-900">
                      {formatDate(selectedInvoice.updated_at)}{" "}
                      {formatTime(selectedInvoice.updated_at)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Bitcoin Address</span>
                    <span className="font-mono text-xs text-gray-900">
                      {selectedInvoice.bitcoin_address.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={closeDetails}
                  className="w-full bg-bitcoin text-white py-3 rounded-xl font-medium hover:bg-bitcoin/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantHistory;
