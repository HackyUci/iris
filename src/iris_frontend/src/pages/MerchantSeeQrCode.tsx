import { useState, useEffect } from "react";
import {
  QrCode,
  Copy,
  Share2,
  Download,
  Store,
  RefreshCw,
  Bitcoin,
  Smartphone,
} from "lucide-react";
import { merchantDashboardService } from "../services/merchant-dashboard.service";

const MerchantSeeQrCode = () => {
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    loadMerchantQRData();
  }, []);

  const loadMerchantQRData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await merchantDashboardService.isAuthenticated();
      if (!isAuth) {
        setError("Please login to view your QR code");
        return;
      }

      const [profileData, qrCodeData] = await Promise.allSettled([
        merchantDashboardService.getMerchantProfile(),
        merchantDashboardService.getStaticQR(),
      ]);

      if (profileData.status === "fulfilled") {
        setMerchantProfile(profileData.value);
      } else {
        console.error("Failed to load profile:", profileData.reason);
        setError("Failed to load merchant profile");
      }

      if (qrCodeData.status === "fulfilled") {
        setQrData(qrCodeData.value);
      } else {
        console.error("Failed to load QR code:", qrCodeData.reason);
        setError("Failed to load QR code");
      }
    } catch (err) {
      console.error("Error loading merchant QR data:", err);
      setError("Failed to load QR code data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareQR = async () => {
    if (qrData && merchantProfile) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${merchantProfile.business_name} - Bitcoin Payment QR`,
            text: `Scan to pay ${merchantProfile.business_name} with Bitcoin`,
            url: qrData.bitcoin_uri,
          });
        } else {
          await copyToClipboard(qrData.bitcoin_uri, "shared");
        }
      } catch (err) {
        console.error("Failed to share QR:", err);
        await copyToClipboard(qrData.bitcoin_uri, "shared");
      }
    }
  };

  const downloadQR = async () => {
    if (qrData) {
      await copyToClipboard(qrData.bitcoin_uri, "download");
    }
  };

  const generateQRCodeDisplay = (data) => {
    if (!data) return null;

    return (
      <div className="w-64 h-64 bg-white border-4 border-gray-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
        <div className="text-center p-6">
          <QrCode size={80} className="mx-auto mb-4 text-gray-600" />
          <div className="text-xs text-gray-500 font-mono break-all px-2 leading-tight">
            Bitcoin QR Code
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your QR code...</p>
        </div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-red-500 mb-4">
            <QrCode size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadMerchantQRData}
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
            <h1 className="text-2xl font-bold text-gray-900">My QR Code</h1>
            <p className="text-sm text-gray-500">
              Static payment QR - like QRIS for Bitcoin
            </p>
          </div>
          <button
            onClick={loadMerchantQRData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && qrData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-yellow-800 text-sm">{error}</span>
            <button
              onClick={loadMerchantQRData}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        {merchantProfile && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-bitcoin/10 p-4 rounded-full mr-4">
                <Store size={32} className="text-bitcoin" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {merchantProfile.business_name}
                </h2>
                <p className="text-sm text-gray-500">
                  Bitcoin Payment Receiver
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Static Payment QR Code
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Like QRIS, but for Bitcoin payments
            </p>

            <div className="mb-8">
              {qrData && generateQRCodeDisplay(qrData)}
            </div>

            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Bitcoin size={16} className="mr-2" />
                Ready for Payments
              </span>
            </div>
          </div>
        </div>

        {qrData && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bitcoin Address
            </h3>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                Your Static Address
              </div>
              <div className="font-mono text-sm text-gray-800 break-all mb-3">
                {qrData.bitcoin_address}
              </div>
              <button
                onClick={() =>
                  copyToClipboard(qrData.bitcoin_address, "address")
                }
                className={`flex items-center justify-center mx-auto transition-colors ${
                  copySuccess === "address"
                    ? "text-green-600"
                    : "text-bitcoin hover:text-bitcoin/80"
                }`}
              >
                <Copy size={16} className="mr-2" />
                {copySuccess === "address" ? "Copied!" : "Copy Address"}
              </button>
            </div>
          </div>
        )}

        {qrData && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment URI
            </h3>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                Bitcoin Payment URI
              </div>
              <div className="font-mono text-xs text-gray-800 break-all mb-3 leading-relaxed">
                {qrData.bitcoin_uri}
              </div>
              <button
                onClick={() => copyToClipboard(qrData.bitcoin_uri, "uri")}
                className={`flex items-center justify-center mx-auto transition-colors ${
                  copySuccess === "uri"
                    ? "text-green-600"
                    : "text-bitcoin hover:text-bitcoin/80"
                }`}
              >
                <Copy size={16} className="mr-2" />
                {copySuccess === "uri" ? "Copied!" : "Copy URI"}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={shareQR}
            className="bg-bitcoin text-white py-3 px-4 rounded-xl font-medium hover:bg-bitcoin/90 transition-colors flex items-center justify-center"
            disabled={!qrData}
          >
            <Share2 size={18} className="mr-2" />
            Share QR
          </button>
          <button
            onClick={downloadQR}
            className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            disabled={!qrData}
          >
            <Download size={18} className="mr-2" />
            {copySuccess === "download" ? "Copied!" : "Copy URI"}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <Smartphone size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-blue-900 font-semibold mb-2">
                How customers can pay:
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Show this QR code to customers</p>
                <p>• They scan with wallet</p>
                <p>• Payments go to your address</p>
                <p>• No amount specified - customers enter amount</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantSeeQrCode;
