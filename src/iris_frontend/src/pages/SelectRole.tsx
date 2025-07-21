import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const SelectRole: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'Customer' | 'Merchant') => {
    console.log('Role selected:', role);
    try {
      setLoading(true);
      const result = await authService.registerUser(role);
      console.log('Registration successful:', result);
      navigate(role === 'Merchant' ? '/merchant' : '/customer');
    } catch (error: any) {
      console.error('Registration failed:', error);
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0'
          }}>
            Welcome to Iris! 🌈
          </h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>

        <p style={{
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '20px'
        }}>
          Choose your role to continue:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div
            onClick={() => !loading && handleRoleSelect('Merchant')}
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '3px solid #10b981',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              transform: loading ? 'none' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🏪</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '15px',
              margin: '0 0 15px 0'
            }}>
              Merchant
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: '0'
            }}>
              Create invoices, generate QR codes, manage Bitcoin payments
            </p>
          </div>

          <div
            onClick={() => !loading && handleRoleSelect('Customer')}
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '3px solid #3b82f6',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              transform: loading ? 'none' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💳</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '15px',
              margin: '0 0 15px 0'
            }}>
              Customer
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: '0'
            }}>
              Scan QR codes, make Bitcoin payments
            </p>
          </div>
        </div>

        {loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '18px',
            color: '#6b7280'
          }}>
            Registering user... ⏳
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectRole;