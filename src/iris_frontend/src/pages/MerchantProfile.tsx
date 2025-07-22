import { useState, useEffect } from "react";
import {
  Store,
  User,
  Calendar,
  Bitcoin,
  Copy,
  Edit3,
  Settings,
} from "lucide-react";
import { merchantDashboardService } from "../services/merchant-dashboard.service";

const MerchantProfile = () => {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState<string | false>(false);

  useEffect(() => {
    loadMerchantData();
  }, []);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await merchantDashboardService.isAuthenticated();
      if (!isAuth) {
        setError("Please login to view your profile");
        return;
      }

      const [profileData, balanceData] = await Promise.allSettled([
        merchantDashboardService.getMerchantProfile(),
        merchantDashboardService.getMerchantBalance(),
      ]);

      if (profileData.status === "fulfilled") {
        setProfile(profileData.value);
      } else {
        console.error("Failed to load profile:", profileData.reason);
        setError("Failed to load merchant profile");
      }

      if (balanceData.status === "fulfilled") {
        setBalance(balanceData.value);
      } else {
        console.log("No balance data available");
      }
    } catch (err) {
      console.error("Error loading merchant data:", err);
      setError("Failed to load merchant data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
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

  const formatSatoshi = (satoshi) => {
    if (!satoshi) return "0";
    return (Number(satoshi) / 100000000).toFixed(8);
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
            <Store size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadMerchantData}
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
              onClick={loadMerchantData}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-bitcoin/10 p-4 rounded-full mr-4">
                <Store size={32} className="text-bitcoin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.business_name || "Loading..."}
                </h1>
                <p className="text-sm text-gray-500">Merchant Profile</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Edit3 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">
                {profile?.total_invoices?.toString() || "0"}
              </div>
              <div className="text-sm text-gray-500">Total Invoices</div>
            </div>
            <div className="text-center p-4 bg-bitcoin/5 rounded-xl">
              <div className="text-2xl font-bold text-bitcoin">
                ₿{formatSatoshi(balance?.total_satoshi)}
              </div>
              <div className="text-sm text-gray-500">Total Balance</div>
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
                    {formatPrincipal(profile?.merchant_principal)}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    profile?.merchant_principal?.toString(),
                    "principal"
                  )
                }
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copySuccess === "principal" ? (
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

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                <Bitcoin size={20} className="text-bitcoin mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Bitcoin Address
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {profile?.static_bitcoin_address
                      ? `${profile.static_bitcoin_address.slice(
                          0,
                          10
                        )}...${profile.static_bitcoin_address.slice(-10)}`
                      : "Generating..."}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(profile?.static_bitcoin_address, "address")
                }
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={!profile?.static_bitcoin_address}
              >
                {copySuccess === "address" ? (
                  <span className="text-green-600 text-xs">Copied!</span>
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </div>

        {balance && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Balance Details
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Confirmed Balance</span>
                <span className="font-medium text-green-700">
                  ₿{formatSatoshi(balance.confirmed_satoshi)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending Balance</span>
                <span className="font-medium text-yellow-700">
                  ₿{formatSatoshi(balance.pending_satoshi)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  Preferred Currency
                </span>
                <span className="font-medium text-gray-700">
                  {balance.preferred_currency
                    ? Object.keys(balance.preferred_currency)[0]
                    : "USD"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button className="bg-bitcoin text-white py-3 px-4 rounded-xl font-medium hover:bg-bitcoin/90 transition-colors flex items-center justify-center">
            <Settings size={18} className="mr-2" />
            Settings
          </button>
          <button
            onClick={loadMerchantData}
            className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-center">
            <h3 className="text-blue-800 font-medium mb-1">
              Your Merchant Profile
            </h3>
            <p className="text-xs text-blue-700">
              This profile contains your business information and Bitcoin
              receiving address. Keep your principal ID secure as it's your
              unique identifier on the Internet Computer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfile;
