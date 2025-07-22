import React, { useState, useEffect } from 'react';
import { QrCode, Copy, RefreshCw, Share2, Store } from 'lucide-react';
import { qrService } from '../services/qr.service';
import type { MerchantProfile, QRCodeData } from '../types/merchant.type';

const MerchantQRCode = () => {
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadMerchantQRData();
  }, []);

  const loadMerchantQRData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isAuth = await qrService.isAuthenticated();
      if (!isAuth) {
        setError('Please login to view your QR code');
        return;
      }

      const { profile, qrData } = await qrService.getMerchantQRData();
      setMerchantProfile(profile);
      setQrData(qrData);
      
    } catch (err) {
      console.error('Failed to load merchant QR data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load QR data');
    } finally {
      setLoading(false);
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
        console.error('Failed to copy address:', err);
      }
    }
  };

  const shareQR = async () => {
    if (qrData && merchantProfile) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Pay ${merchantProfile.business_name} with Bitcoin`,
            text: `Scan to pay with Bitcoin`,
            url: qrData.bitcoin_uri
          });
        } else {
          await navigator.clipboard.writeText(qrData.bitcoin_uri);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
      } catch (err) {
        console.error('Failed to share QR:', err);
      }
    }
  };

  const generateQRCodeSVG = (data: string) => {
    return (
      <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
        <div className="text-center p-4">
          <QrCode size={64} className="mx-auto mb-2 text-gray-400" />
          <div className="text-xs text-gray-500 font-mono break-all px-2">
            {data.slice(0, 20)}...
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
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
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
                  {merchantProfile.merchant_principal?.toString().slice(0, 16)}...
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
              {qrData && generateQRCodeSVG(qrData.bitcoin_uri)}
            </div>

            {qrData && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                  Bitcoin Address
                </div>
                <div className="font-mono text-sm text-gray-800 break-all mb-3 px-2">
                  {qrData.bitcoin_address}
                </div>
                <button
                  onClick={copyAddress}
                  className={`flex items-center justify-center mx-auto transition-colors ${
                    copySuccess 
                      ? 'text-green-600' 
                      : 'text-bitcoin hover:text-bitcoin/80'
                  }`}
                >
                  <Copy size={16} className="mr-2" />
                  {copySuccess ? 'Copied!' : 'Copy Address'}
                </button>
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
                {loading ? 'Loading...' : 'Refresh'}
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
      </div>
    </div>
  );
};

export default MerchantQRCode;