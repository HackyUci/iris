import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const SelectRole: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = async (role: "Customer" | "Merchant") => {
    if (loading) return;

    setSelectedRole(role);
    try {
      setLoading(true);
      const result = await authService.registerUser(role);

      if (role === "Merchant") {
        navigate("/input-merchant-name");
      } else {
        navigate("/customer");
      }
    } catch (error: any) {
      if (error.message && error.message.includes("already registered")) {
        try {
          const profile = await authService.getUserProfile();
          if (profile) {
            if (profile.role === "Merchant") {
              navigate("/input-merchant-name");
            } else {
              navigate("/customer");
            }
            return;
          }
        } catch (profileError) {
          console.error("Failed to get existing profile:", profileError);
        }
      }
      alert(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl animate-float"></div>
        <div className="w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl animate-float-delay"></div>
      </div>

      <div className="max-w-md w-full mx-auto text-center relative z-10 bg-gray-100 bg-opacity-70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-black mb-2">Select Your Role</h1>
        <p className="text-gray-400 mb-8">Choose how you want to interact with the platform</p>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => !loading && handleRoleSelect('Merchant')}
            onMouseEnter={() => setSelectedRole('Merchant')}
            onMouseLeave={() => setSelectedRole(null)}
            className={`w-full py-4 px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
              selectedRole === 'Merchant' 
                ? 'border-blue-500 bg-gray-700 shadow-lg shadow-blue-500/20' 
                : 'border-gray-700 hover:border-blue-400'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black">Merchant</h3>
                <p className="text-xs text-gray-400">Manage your business and products</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => !loading && handleRoleSelect('Customer')}
            onMouseEnter={() => setSelectedRole('Customer')}
            onMouseLeave={() => setSelectedRole(null)}
            className={`w-full py-4 px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
              selectedRole === 'Customer' 
                ? 'border-purple-500 bg-gray-700 shadow-lg shadow-purple-500/20' 
                : 'border-gray-700 hover:border-purple-400'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black">Customer</h3>
                <p className="text-xs text-gray-400">Browse and purchase products</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center justify-center mx-auto"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>

        {loading && (
          <div className="mt-6 flex flex-col items-center">
            <div className="relative w-12 h-12">
              <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute"></div>
              <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin-reverse absolute opacity-70"></div>
            </div>
            <p className="text-gray-400 mt-4 text-sm font-medium">Completing authorization...</p>
            <p className="text-gray-500 text-xs mt-1">Confirming with your wallet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectRole;