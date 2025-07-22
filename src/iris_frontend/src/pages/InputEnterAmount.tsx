import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Store,
  Bitcoin,
  CreditCard,
  Wallet,
  ExternalLink,
} from "lucide-react";
import {
  customerPaymentService,
  PaymentMethodType,
} from "../services/customer-payment.service";

interface ScannedQRData {
  type: string;
  address?: string;
  amount?: string;
  label?: string;
  message?: string;
  invoiceId?: string;
  raw: string;
}

interface PaymentMethodOption {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  currencies: string[];
}

const InputEnterAmount: React.FC = () => {
  const [scannedData, setScannedData] = useState<ScannedQRData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>(
    []
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversion, setConversion] = useState<any>(null);

  const supportedCurrencies = customerPaymentService.getSupportedCurrencies();

  useEffect(() => {
    loadScannedData();
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (amount && selectedCurrency) {
      calculateConversion();
    }
  }, [amount, selectedCurrency]);

  const loadScannedData = () => {
    const storedData = sessionStorage.getItem("scannedQRData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setScannedData(parsed);

      if (parsed.amount) {
        setAmount(parsed.amount);
      }
    }
    setLoading(false);
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await customerPaymentService.getAvailablePaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Error loading payment methods:", err);
      setError("Failed to load payment methods");
    }
  };

  const calculateConversion = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setConversion(null);
      return;
    }

    try {
      const conversionResult =
        await customerPaymentService.convertCurrencyToBTC(
          parseFloat(amount),
          selectedCurrency
        );
      setConversion(conversionResult);
    } catch (err) {
      console.error("Error calculating conversion:", err);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setSelectedPaymentMethod(method);
    setError(null);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    if (currency !== "BTC" && selectedPaymentMethod !== "MockUSD") {
      setSelectedPaymentMethod("MockUSD");
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod || !scannedData) {
      setError("Please select a payment method");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const paymentResult = await customerPaymentService.processPayment({
        invoiceId: scannedData.invoiceId || "",
        amount: parseFloat(amount),
        currency: selectedCurrency as any,
        paymentMethod: selectedPaymentMethod,
        bitcoinAddress: scannedData.address,
      });

      const paymentData = {
        ...paymentResult,
        merchantName: scannedData.label || "Unknown Merchant",
      };

      sessionStorage.setItem("paymentResult", JSON.stringify(paymentData));
      window.location.href = "/customer-payment-success";
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodIcon = (methodId: PaymentMethodType) => {
    switch (methodId) {
      case "MockUSD":
        return <CreditCard size={20} />;
      case "PlugWallet":
        return <Wallet size={20} />;
      case "ExternalWallet":
        return <Bitcoin size={20} />;
      default:
        return <CreditCard size={20} />;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    return (
      supportedCurrencies.find((c) => c.code === currency)?.symbol || currency
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!scannedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-2xl">⚠️</div>
          <p className="text-gray-600 mb-4">No scan data found</p>
          <button
            onClick={() => (window.location.href = "/scan")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Scan QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 mx-auto">
            Enter Payment Amount
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Store size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {scannedData.label || "Static QR Payment"}
              </h2>
              <p className="text-sm text-gray-500">Scanned QR Code</p>
            </div>
          </div>

          {scannedData.address && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Bitcoin Address</div>
              <div className="font-mono text-sm text-gray-800 break-all">
                {scannedData.address}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Amount
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {supportedCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedCurrency === currency.code
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {currency.symbol} {currency.code}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-lg">
                {getCurrencySymbol(selectedCurrency)}
              </span>
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {conversion && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>
                    {customerPaymentService.formatCurrencyAmount(
                      conversion.fromAmount,
                      conversion.fromCurrency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bitcoin Amount:</span>
                  <span>{conversion.toAmount.toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between text-xs opacity-75">
                  <span>Exchange Rate:</span>
                  <span>
                    1 BTC ={" "}
                    {customerPaymentService.formatCurrencyAmount(
                      conversion.exchangeRate,
                      conversion.fromCurrency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Method
          </h3>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                disabled={!method.available}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  selectedPaymentMethod === method.id
                    ? "bg-blue-50 border-blue-500 text-blue-900"
                    : method.available
                    ? "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900"
                    : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3 text-xl">
                    {getPaymentMethodIcon(method.id)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm opacity-75">
                      {method.description}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      Supports: {method.currencies.join(", ")}
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <div className="text-blue-600">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleProcessPayment}
            disabled={
              !selectedPaymentMethod ||
              !amount ||
              parseFloat(amount) <= 0 ||
              processing
            }
            className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <ExternalLink size={18} className="mr-2" />
                Pay{" "}
                {amount &&
                  customerPaymentService.formatCurrencyAmount(
                    parseFloat(amount),
                    selectedCurrency
                  )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputEnterAmount;
