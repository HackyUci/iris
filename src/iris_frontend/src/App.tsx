import React, { useState, useEffect } from 'react';
import { authService } from './auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Customer' | 'Merchant' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      await authService.init();
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        setIsLoggedIn(true);
        await checkUserProfile();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async () => {
    try {
      const actor = authService.getActor();
      const result = await actor.get_user_profile();
      
      if (result && typeof result === 'object' && 'Ok' in result) {
        const okResult = result as { Ok: { role: 'Customer' | 'Merchant' } };
        setUserProfile(okResult.Ok);
        setSelectedRole(okResult.Ok.role);
      }
    } catch (error) {
      console.log('No existing user profile found');
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.login();
      setIsLoggedIn(true);
      await checkUserProfile();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setSelectedRole(null);
    setUserProfile(null);
  };

  const handleRoleSelect = async (role: 'Customer' | 'Merchant') => {
    try {
      setLoading(true);
      const actor = authService.getActor();
      
      const result: any = await actor.register_user({
        role: { [role]: null }
      });
      
      if ('Ok' in result) {
        setSelectedRole(role);
        setUserProfile(result.Ok);
        console.log(`Successfully registered as ${role}`);
      } else {
        throw new Error(result.Err);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>🌈 Iris</h1>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            border: '2px solid #ddd', 
            borderTop: '2px solid #2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem' 
      }}>
        <div style={{ 
          maxWidth: '28rem', 
          width: '100%', 
          backgroundColor: 'white', 
          borderRadius: '0.75rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          padding: '2rem', 
          textAlign: 'center' 
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>🌈 Iris</h1>
          <h2 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '1rem' }}>Bitcoin Payment System</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Connect with Internet Identity to get started</p>
          
          <button 
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#93c5fd' : '#2563eb',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '1.125rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Connecting...' : 'Connect Internet Identity'}
          </button>
        </div>
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Welcome to Iris!</h1>
            <button 
              onClick={handleLogout} 
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
          
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem', fontSize: '1.125rem' }}>Choose your role to continue:</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem', 
            maxWidth: '32rem', 
            margin: '0 auto' 
          }}>
            <div 
              onClick={() => !loading && handleRoleSelect('Merchant')}
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '2px solid #bbf7d0',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1,
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏪</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Merchant</h3>
              <p style={{ color: '#6b7280' }}>Create invoices, generate QR codes, manage payments</p>
            </div>
            
            <div 
              onClick={() => !loading && handleRoleSelect('Customer')}
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '2px solid #bfdbfe',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1,
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💳</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>Customer</h3>
              <p style={{ color: '#6b7280' }}>Scan QR codes, make Bitcoin payments</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ 
          maxWidth: '72rem', 
          margin: '0 auto', 
          padding: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Welcome, {selectedRole}!</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {authService.getPrincipal()?.toString()}
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
        {selectedRole === 'Merchant' && (
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              🏪 Merchant Dashboard
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <button style={{
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}>
                Create Invoice
              </button>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}>
                Generate QR Code
              </button>
              <button style={{
                backgroundColor: '#6b7280',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}>
                View Dashboard
              </button>
            </div>
          </div>
        )}
        
        {selectedRole === 'Customer' && (
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              💳 Customer Portal
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              maxWidth: '28rem'
            }}>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}>
                Scan QR Code
              </button>
              <button style={{
                backgroundColor: '#eab308',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}>
                Payment History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;