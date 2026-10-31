import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();
  const toast = useToast();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    toast.error('Access restricted to administrators only.');
    return <Navigate to="/" replace />;
  }

  return children;
}
