// ==============================================================================
// BrightPath CRM — ProtectedRoute Guard
// Protects internal workspace routes against unauthenticated access
// ==============================================================================

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--slate-50)',
          gap: '16px',
        }}
      >
        <Loader2
          size={36}
          style={{
            animation: 'spin 1s linear infinite',
            color: 'var(--primary-600)',
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)' }}>
            Verifying Authentication
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Restoring BrightPath CRM session...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
