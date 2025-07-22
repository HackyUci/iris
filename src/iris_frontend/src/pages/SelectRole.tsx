import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const SelectRole: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = async (role: "Customer" | "Merchant") => {
    if (loading) return;

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
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl px-8 py-10 text-center">

        <img src="/Logo_IRIS_gradient.svg" alt="Logo" className="w-48 h-24 mx-auto mb-4" />
        <p className="text-gray-600 text-sm mb-8">Choose how you want to interact with the platform</p>

        <div className="space-y-4 mb-6 text-left">

          <button
            onClick={() => handleRoleSelect('Merchant')}
            onMouseEnter={() => setHoveredRole('Merchant')}
            onMouseLeave={() => setHoveredRole(null)}
            className={`w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-sm border
              ${hoveredRole === 'Merchant'
                ? 'bg-blue-500 text-white border-transparent shadow-md'
                : 'bg-white text-black border-gray-300 hover:border-blue-400'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={loading}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 
                ${hoveredRole === 'Merchant' ? 'bg-white/20' : 'bg-blue-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${hoveredRole === 'Merchant' ? 'text-white' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Merchant</h3>
                <p className={`text-xs ${hoveredRole === 'Merchant' ? 'text-white/90' : 'text-gray-500'}`}>
                  Manage your business and products
                </p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${hoveredRole === 'Merchant' ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => handleRoleSelect('Customer')}
            onMouseEnter={() => setHoveredRole('Customer')}
            onMouseLeave={() => setHoveredRole(null)}
            className={`w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-semibold text-sm border
              ${hoveredRole === 'Customer'
                ? 'bg-purple-500 text-white border-transparent shadow-md'
                : 'bg-white text-black border-gray-300 hover:border-purple-400'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={loading}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 
                ${hoveredRole === 'Customer' ? 'bg-white/20' : 'bg-purple-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${hoveredRole === 'Customer' ? 'text-white' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p className={`text-xs ${hoveredRole === 'Customer' ? 'text-white/90' : 'text-gray-500'}`}>
                  Browse and purchase products
                </p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${hoveredRole === 'Customer' ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-black transition-colors duration-200 text-sm mt-6 font-medium flex items-center justify-center gap-2 mx-auto"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </button>

        <div className="mt-10 border-t pt-4 text-gray-400 text-xs">
          Secure decentralized authentication powered by ICP
        </div>
      </div>
    </div>
  );
};

export default SelectRole;