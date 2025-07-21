import React, { useState, useEffect, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'Customer' | 'Merchant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'Customer' | 'Merchant' | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.init();
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          const profile = await authService.getUserProfile();
          if (profile) {
            setUserRole(profile.role);
          } else {
            console.log('User authenticated but no profile found');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ color: '#6b7280', marginTop: '16px' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!userRole) {
    if (location.pathname === '/select-role') {
      return <>{children}</>;
    }
    return <Navigate to="/select-role" />;
  }

  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;