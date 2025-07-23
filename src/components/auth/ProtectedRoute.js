// src/components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

/**
 * A wrapper component that renders children only if the user is authenticated.
 * If not authenticated, it will redirect to the login page.
 */
export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        // If no roles required, just check authentication
        if (requiredRoles.length === 0) {
          setIsAuthorized(isAuthenticated);
        } else {
          // Check if user has any of the required roles
          const hasRequiredRole = user?.roles?.some(role => 
            requiredRoles.includes(role)
          );
          setIsAuthorized(isAuthenticated && hasRequiredRole);
        }
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, requiredRoles, user]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    // User is authenticated but not authorized for this route
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * Higher-order component for protecting routes with authentication
 */
export const withAuth = (Component, requiredRoles = []) => {
  return (props) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
