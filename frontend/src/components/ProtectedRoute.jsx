import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating session with API Gateway..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-danger)', marginBottom: '0.75rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          This page requires the <strong>{requiredRole}</strong> role. Your active role is <strong>{user?.role}</strong>.
        </p>
        <Link
          to={user?.role === 'DRIVER' ? '/driver' : user?.role === 'ADMIN' ? '/admin' : '/book'}
          className="btn btn-primary"
        >
          Return to Console
        </Link>
      </div>
    );
  }

  return children;
};
