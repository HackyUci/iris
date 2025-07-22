import { useState, useEffect } from "react";
import { User, Calendar, TrendingUp, Copy, RefreshCw } from "lucide-react";
import { customerService } from "../services/customer.service";

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await customerService.isAuthenticated();
      if (!isAuth) {
        setError("Please login to view your profile");
        return;
      }

      const [profileData] = await Promise.allSettled([
        customerService.getCustomerProfile(),
      ]);

      if (profileData.status === "fulfilled") {
        setProfile(profileData.value);
      } else {
        console.error("Failed to load profile:", profileData.reason);
        setError("Failed to load customer profile");
      }
    } catch (err) {
      console.error("Error loading customer data:", err);
      setError("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrincipal = (principal) => {
    if (!principal) return "N/A";
    const principalStr = principal.toString();
    return `${principalStr.slice(0, 8)}...${principalStr.slice(-6)}`;
  };

  const formatRole = (role) => {
    if (!role) return "N/A";
    if (typeof role === "string") {
      return role;
    } else if (typeof role === "object" && role !== null) {
      return Object.keys(role)[0];
    }
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-red-500 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCustomerData}
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
        {error && profile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-yellow-800 text-sm">{error}</span>
            <button
              onClick={loadCustomerData}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-4 rounded-full mr-4">
                <User size={32} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Customer Profile
                </h1>
                <p className="text-sm text-gray-500">
                  Your account information
                </p>
              </div>
            </div>
            <button
              onClick={loadCustomerData}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700">Customer</div>
              <div className="text-sm text-purple-600">Account Type</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-700">
                {balance ? `$${balance.usd_balance}` : "$0"}
              </div>
              <div className="text-sm text-green-600">USD Balance</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                <User size={20} className="text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Principal ID
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {formatPrincipal(profile?.user_principal)}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(profile?.user_principal?.toString())
                }
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copySuccess ? (
                  <span className="text-green-600 text-xs">Copied!</span>
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <Calendar size={20} className="text-gray-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Member Since
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(profile?.created_at)}
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <TrendingUp size={20} className="text-gray-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  User Role
                </div>
                <div className="text-xs text-gray-500">
                  {formatRole(profile?.role)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-purple-100 text-purple-700 py-3 px-4 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center justify-center">
              <User size={18} className="mr-2" />
              Edit Profile
            </button>
            <button
              onClick={loadCustomerData}
              className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-center">
            <h3 className="text-blue-800 font-medium mb-1">Customer Account</h3>
            <p className="text-xs text-blue-700">
              You can scan QR codes from merchants to make Bitcoin payments.
              Your payment history and balance are tracked securely on the
              Internet Computer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
