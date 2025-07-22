import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.init();
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          const profile = await authService.getUserProfile();
          if (profile) {
            navigate(profile.role === 'Merchant' ? '/merchant' : '/customer');
          } else {
            navigate('/select-role');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.login();

      const profile = await authService.getUserProfile();
      if (profile) {
        navigate(profile.role === 'Merchant' ? '/merchant' : '/customer');
      } else {
        navigate('/select-role');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 text-center">
        <img src="/Logo_IRIS_gradient.svg" alt="Logo" className="w-48 h-24 mx-auto" />
        <p className="text-gray-500 mb-8">Making payment with crypto easy</p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 text-white font-semibold text-sm
            ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-green-400 hover:shadow-lg hover:brightness-105'}
          `}
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          {loading ? 'Connecting...' : 'Connect Internet Identity'}
        </button>

        {loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="relative w-12 h-12">
              <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-full h-full border-4 border-green-400 border-t-transparent rounded-full animate-spin-reverse opacity-70"></div>
            </div>
            <p className="text-gray-500 mt-4 text-sm font-medium">Authenticating...</p>
            <p className="text-gray-400 text-xs mt-1">Confirming with your wallet</p>
          </div>
        )}

        <div className="mt-10 border-t pt-4 text-gray-400 text-xs">
          Secure decentralized authentication powered by ICP
        </div>
      </div>
    </div>
  );
};

export default LoginPage;