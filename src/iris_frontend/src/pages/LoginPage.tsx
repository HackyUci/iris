import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl animate-float"></div>
        <div className="w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl animate-float-delay"></div>
      </div>

      <div className="max-w-md w-full mx-auto text-center relative z-10 bg-gray-100 bg-opacity-70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-black mb-2">Welcome to Iris</h1>
        <p className="text-gray-400 mb-8">Bitcoin Payment System</p>

        <button 
          onClick={handleLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
            isHovered 
              ? 'border-blue-500 bg-gray-700 shadow-lg shadow-blue-500/20' 
              : 'border-gray-700 hover:border-blue-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="font-semibold text-black">
            {loading ? 'Connecting...' : 'Connect Internet Identity'}
          </span>
        </button>

        {loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="relative w-12 h-12">
              <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute"></div>
              <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin-reverse absolute opacity-70"></div>
            </div>
            <p className="text-gray-400 mt-4 text-sm font-medium">Authenticating...</p>
            <p className="text-gray-500 text-xs mt-1">Confirming with your wallet</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-300">
          <p className="text-gray-500 text-sm">Secure decentralized authentication powered by ICP</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;