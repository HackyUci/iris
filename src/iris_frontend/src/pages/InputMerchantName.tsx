import { useState } from "react";
import { Store, ArrowRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InputMerchantName = () => {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }

    if (businessName.trim().length < 2) {
      setError("Business name must be at least 2 characters");
      return;
    }

    if (businessName.trim().length > 100) {
      setError("Business name must be less than 100 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { authService } = await import("../services/auth.service");
      const actor = authService.getActor();
      const request = { business_name: businessName.trim() };

      console.log("Registering merchant with:", request);
      const result = await actor.register_merchant(request);

      if ("Ok" in result) {
        console.log("Merchant registered successfully:", result.Ok);
        navigate("/merchant");
      } else {
        throw new Error(result.Err || "Failed to register merchant");
      }
    } catch (err) {
      console.error("Failed to register merchant:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/select-role");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl animate-float"></div>
        <div className="w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl animate-float-delay"></div>
      </div>

      <div className="max-w-md w-full mx-auto text-center relative z-10 bg-gray-100 bg-opacity-70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Setup Your Business
          </h1>
          <p className="text-gray-400">
            Enter your business name to get started with Bitcoin payments
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (error) setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter your business name"
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
                disabled={loading}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">
                {businessName.length}/100 characters
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !businessName.trim()}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
              loading || !businessName.trim()
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Creating Account...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleBack}
          disabled={loading}
          className="mt-6 text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center justify-center mx-auto"
        >
          ← Back to role selection
        </button>

        {loading && (
          <div className="mt-6 flex flex-col items-center">
            <div className="relative w-12 h-12">
              <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute"></div>
              <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin-reverse absolute opacity-70"></div>
            </div>
            <p className="text-gray-400 mt-4 text-sm font-medium">
              Setting up your merchant account...
            </p>
            <p className="text-gray-500 text-xs mt-1">
              This may take a few moments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputMerchantName;
