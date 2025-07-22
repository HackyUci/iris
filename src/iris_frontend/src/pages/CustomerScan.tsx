import { useState } from "react";
import {
  ChevronLeft,
  Camera,
  FlashlightIcon as Flashlight,
  Type,
} from "lucide-react";
import { Scanner as ScannerComp } from "@yudiel/react-qr-scanner";
import { customerService } from "../services/customer.service";

const CustomerScan = () => {
  const [input, setInput] = useState<string>("");
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);

  const handleScan = async (qrData: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Scanned QR data:", qrData);

      const parsedData = parseQRCode(qrData);

      if (parsedData.type === "bitcoin") {
        console.log("Bitcoin payment QR detected:", parsedData);
        setScannedData(parsedData);
        setScanning(false);
      } else if (parsedData.type === "invoice") {
        console.log("Iris invoice QR detected:", parsedData);
        const invoice = await customerService.getInvoiceByQRScan(
          parsedData.invoiceId
        );
        setScannedData({ ...parsedData, invoice });
        setScanning(false);
      } else {
        setError(
          "Invalid QR code format. Please scan a valid payment QR code."
        );
      }
    } catch (err) {
      console.error("Error processing QR scan:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process QR code"
      );
    } finally {
      setLoading(false);
    }
  };

  const parseQRCode = (qrData: string) => {
    if (qrData.startsWith("bitcoin:")) {
      const url = new URL(qrData);
      return {
        type: "bitcoin",
        address: url.pathname,
        amount: url.searchParams.get("amount"),
        label: url.searchParams.get("label"),
        message: url.searchParams.get("message"),
        raw: qrData,
      };
    }

    if (
      qrData.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/) ||
      qrData.match(/^bc1[a-z0-9]{39,59}$/)
    ) {
      return {
        type: "bitcoin",
        address: qrData,
        raw: qrData,
      };
    }

    if (qrData.startsWith("IRIS-") || qrData.match(/^[A-Za-z0-9-]+$/)) {
      return {
        type: "invoice",
        invoiceId: qrData,
        raw: qrData,
      };
    }

    try {
      const parsed = JSON.parse(qrData);
      if (parsed.invoice_id || parsed.bitcoin_address) {
        return {
          type: "invoice",
          ...parsed,
          raw: qrData,
        };
      }
    } catch (e) {
    }

    return {
      type: "unknown",
      raw: qrData,
    };
  };

  const handleManualInput = () => {
    if (input.trim()) {
      handleScan(input.trim());
    }
  };

  const handleGoBack = () => {
    if (scannedData) {
      setScannedData(null);
      setScanning(true);
      setError(null);
    } else {
      window.history.back();
    }
  };

  const handleProceedToPayment = () => {
    console.log("Proceeding to payment with:", scannedData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 mx-auto">
            {scannedData ? "Payment Details" : "Scan to Pay"}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 text-sm font-medium mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {scannedData ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  QR Code Scanned
                </h2>
                <p className="text-gray-600 text-sm">
                  Payment details detected
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Type
                  </span>
                  <span className="text-sm text-gray-900 capitalize">
                    {scannedData.type}
                  </span>
                </div>

                {scannedData.address && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Bitcoin Address
                    </span>
                    <span className="text-sm text-gray-900 font-mono">
                      {scannedData.address.slice(0, 8)}...
                      {scannedData.address.slice(-6)}
                    </span>
                  </div>
                )}

                {scannedData.amount && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Amount
                    </span>
                    <span className="text-sm text-gray-900">
                      {scannedData.amount} BTC
                    </span>
                  </div>
                )}

                {scannedData.label && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Merchant
                    </span>
                    <span className="text-sm text-gray-900">
                      {scannedData.label}
                    </span>
                  </div>
                )}

                {scannedData.invoiceId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Invoice ID
                    </span>
                    <span className="text-sm text-gray-900 font-mono">
                      {scannedData.invoiceId}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoBack}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        ) : scanning ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
                  Point your camera at the QR code
                </h2>
              </div>

              <div className="relative">
                <ScannerComp
                  formats={["qr_code"]}
                  onScan={(detectedCodes) => {
                    console.log(
                      "onScan:",
                      JSON.stringify(detectedCodes, null, 2)
                    );
                    if (detectedCodes && detectedCodes.length > 0) {
                      const code = detectedCodes[0].rawValue;
                      handleScan(code);
                    }
                  }}
                  onError={(error) => {
                    console.log(`Scanner error: ${error}`);
                    setError("Camera access failed. Please check permissions.");
                  }}
                  components={{
                    torch: true,
                    zoom: false,
                    finder: true,
                  }}
                  allowMultiple={false}
                  scanDelay={1000}
                  styles={{
                    container: {
                      width: "100%",
                      height: "300px",
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                <Camera size={20} className="mr-2" />
                Gallery
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                <Flashlight size={20} className="mr-2" />
                Flash
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">
                  or enter manually
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type size={16} className="inline mr-2" />
                    QR Code Data
                  </label>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste QR code data or invoice ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleManualInput}
                  disabled={!input.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Process Code
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerScan;
