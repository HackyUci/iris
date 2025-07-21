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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🌈 Iris</h1>
        <h2 className="text-xl text-gray-700 mb-4">Bitcoin Payment System</h2>
        <p className="text-slate-500 mb-8">Connect with Internet Identity to get started</p>
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          {loading ? 'Connecting...' : 'Connect Internet Identity'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;