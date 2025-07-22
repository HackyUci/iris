import { useState, useEffect, useRef } from "react";
import { QrCode, Copy, RefreshCw, Share2, Store } from "lucide-react";
import QRCode from "qrcode";
import { qrService } from "../services/qr.service";
import type { MerchantProfile, QRCodeData } from "../types/merchant.type";

const MerchantQRCode = () => {
  const [merchantProfile, setMerchantProfile] =
    useState<MerchantProfile | null>(null);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadMerchantQRData();
  }, []);

  useEffect(() => {
    if (qrData?.bitcoin_uri) {
      generateQRCode(qrData.bitcoin_uri);
    }
  }, [qrData]);

  const loadMerchantQRData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await qrService.isAuthenticated();
      if (!isAuth) {
        setError("Please login to view your QR code");
        return;
      }

      const { profile, qrData } = await qrService.getMerchantQRData();
      setMerchantProfile(profile);
      setQrData(qrData);
    } catch (err) {
      console.error("Failed to load merchant QR data:", err);
      setError(err instanceof Error ? err.message : "Failed to load QR data");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      setQrCodeUrl(url);

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, data, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError("Failed to generate QR code");
    }
  };

  const handleRefresh = async () => {
    await loadMerchantQRData();
  };

  const copyAddress = async () => {
    if (qrData?.bitcoin_address) {
      try {
        await navigator.clipboard.writeText(qrData.bitcoin_address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  const copyQRData = async () => {
    if (qrData?.bitcoin_uri) {
      try {
        await navigator.clipboard.writeText(qrData.bitcoin_uri);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy QR data:", err);
      }
    }
  };

  const shareQR = async () => {
    if (qrData && merchantProfile) {
      try {
        if (navigator.share) {
          if (canvasRef.current) {
            canvasRef.current.toBlob(async (blob) => {
              if (blob) {
                const file = new File([blob], "payment-qr.png", {
                  type: "image/png",
                });
                await navigator.share({
                  title: `Pay ${merchantProfile.business_name} with Bitcoin`,
                  text: `Scan to pay with Bitcoin: ${qrData.bitcoin_address}`,
                  files: [file],
                });
              }
            });
          }
        } else {
          await navigator.clipboard.writeText(qrData.bitcoin_uri);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
      } catch (err) {
        console.error("Failed to share QR:", err);
        copyQRData();
      }
    }
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${
        merchantProfile?.business_name || "merchant"
      }-bitcoin-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-red-500 mb-4">
            <Store size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
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
        {error && qrData && (
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

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IRIS QR</h1>
              <p className="text-sm text-gray-600">Bitcoin Payment Code</p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {merchantProfile && (
            <div className="flex items-center">
              <div className="bg-bitcoin/10 p-3 rounded-full mr-4">
                <Store size={24} className="text-bitcoin" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {merchantProfile.business_name}
                </h2>
                <p className="text-sm text-gray-500 font-mono">
                  {merchantProfile.merchant_principal?.toString().slice(0, 16)}
                  ...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Static Payment QR
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Scan with any Bitcoin wallet to pay
            </p>

            <div className="flex justify-center mb-6">
              {qrCodeUrl ? (
                <div className="relative">
                  <img
                    src={qrCodeUrl}
                    alt="Bitcoin Payment QR Code"
                    className="w-48 h-48 border-2 border-gray-200 rounded-xl bg-white"
                  />
                  {/* Hidden canvas for sharing/download */}
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                    width={256}
                    height={256}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center p-4">
                    <QrCode size={64} className="mx-auto mb-2 text-gray-400" />
                    <div className="text-xs text-gray-500">
                      Generating QR...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {qrData && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                  Bitcoin Address
                </div>
                <div className="font-mono text-sm text-gray-800 break-all mb-3 px-2">
                  {qrData.bitcoin_address}
                </div>

                {qrData.bitcoin_uri && (
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium border-t border-gray-200 pt-3 mt-3">
                    Bitcoin URI
                  </div>
                )}
                {qrData.bitcoin_uri && (
                  <div className="font-mono text-xs text-gray-600 break-all mb-3 px-2 bg-white rounded p-2">
                    {qrData.bitcoin_uri}
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={copyAddress}
                    className={`flex items-center justify-center transition-colors text-sm px-3 py-1 rounded ${
                      copySuccess
                        ? "text-green-600 bg-green-50"
                        : "text-bitcoin hover:text-bitcoin/80 hover:bg-bitcoin/5"
                    }`}
                  >
                    <Copy size={14} className="mr-1" />
                    {copySuccess ? "Copied!" : "Copy Address"}
                  </button>

                  <button
                    onClick={copyQRData}
                    className="flex items-center justify-center transition-colors text-sm px-3 py-1 rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <QrCode size={14} className="mr-1" />
                    Copy URI
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Ready for Payment
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button
                onClick={downloadQR}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                disabled={!qrCodeUrl}
              >
                Download
              </button>
              <button
                onClick={shareQR}
                className="flex-1 bg-bitcoin text-white py-3 px-4 rounded-xl font-medium hover:bg-bitcoin/90 transition-colors flex items-center justify-center"
                disabled={!qrData}
              >
                <Share2 size={18} className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-center">
            <h3 className="text-blue-800 font-medium mb-1">How it Works</h3>
            <p className="text-xs text-blue-700">
              This QR code contains your Bitcoin address and can be scanned by
              any Bitcoin wallet. Customers can scan it to send payments
              directly to your address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantQRCode;
