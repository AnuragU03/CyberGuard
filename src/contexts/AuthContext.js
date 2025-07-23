// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const { success, data, error: profileError } = await authService.getProfile();
          if (success) {
            setCurrentUser(data);
          } else {
            console.error('Failed to fetch user profile:', profileError);
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const { success, token, error: loginError } = await authService.login(email, password);
      
      if (success) {
        // Get user profile after successful login
        const { success: profileSuccess, data } = await authService.getProfile();
        if (profileSuccess) {
          setCurrentUser(data);
          return { success: true };
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else {
        throw new Error(loginError || 'Login failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const { success, error: registerError } = await authService.register(userData);
      
      if (success) {
        return { success: true };
      } else {
        throw new Error(registerError || 'Registration failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const { success, data, error: updateError } = await authService.updateProfile(profileData);
      
      if (success) {
        setCurrentUser(data);
        return { success: true };
      } else {
        throw new Error(updateError || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const { success, error: changePwError } = await authService.changePassword(
        currentPassword,
        newPassword
      );
      
      if (success) {
        return { success: true };
      } else {
        throw new Error(changePwError || 'Failed to change password');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const { success, error: resetError } = await authService.requestPasswordReset(email);
      
      if (success) {
        return { success: true };
      } else {
        throw new Error(resetError || 'Failed to request password reset');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const { success, error: resetError } = await authService.resetPassword(token, newPassword);
      
      if (success) {
        return { success: true };
      } else {
        throw new Error(resetError || 'Failed to reset password');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.roles?.includes(role) || false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  // Check if user has all of the specified roles
  const hasAllRoles = (roles) => {
    return roles.every(role => hasRole(role));
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
