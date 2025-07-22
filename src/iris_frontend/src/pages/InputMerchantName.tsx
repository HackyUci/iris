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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store size={32} className="text-blue-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Setup Your Business</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your business name to get started with Bitcoin payments
        </p>

        <div className="text-left mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building2 size={18} className="text-gray-400" />
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none"
              disabled={loading}
              maxLength={100}
              autoFocus
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">
              {businessName.length}/100 characters
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !businessName.trim()}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold text-sm transition-all duration-300
            ${
              loading || !businessName.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-green-400 hover:shadow-lg hover:brightness-105"
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="relative w-12 h-12">
              <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-full h-full border-4 border-green-400 border-t-transparent rounded-full animate-spin-reverse opacity-70"></div>
            </div>
            <p className="text-gray-500 mt-4 text-sm font-medium">
              Setting up your merchant account...
            </p>
            <p className="text-gray-400 text-xs mt-1">
              This may take a few moments
            </p>
          </div>
        )}

        <div className="mt-10 border-t pt-4 text-gray-400 text-xs">
          Secure merchant onboarding powered by ICP
        </div>
      </div>
    </div>
  );
};

export default InputMerchantName;