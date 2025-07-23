// src/services/authService.js
import axios from 'axios';
import config from '../config';

export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: config.api.url,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              // Update the Authorization header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              // Retry the original request
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, log the user out
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Login with email and password
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      const { token, refreshToken } = response.data;
      
      // Store tokens
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      
      return { success: true, token };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  }
  
  // Register a new user
  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  }
  
  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await this.api.post('/auth/refresh-token', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data;
      
      // Update stored tokens
      this.setToken(token);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }
      
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.logout();
      return null;
    }
  }
  
  // Logout the user
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Additional cleanup can be added here
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
  
  // Get stored token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  // Store token
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
  
  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  
  // Store refresh token
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
  
  // Get user profile
  async getProfile() {
    try {
      const response = await this.api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  }
  
  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/auth/me', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  }
  
  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to change password' 
      };
    }
  }
  
  // Request password reset
  async requestPasswordReset(email) {
    try {
      await this.api.post('/auth/request-password-reset', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to request password reset' 
      };
    }
  }
  
  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      await this.api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;
