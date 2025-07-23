// src/utils/apiClient.js
import axios from 'axios';
import { getErrorMessage, ApiError, ValidationError } from './errorHandler';
import config from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: config.api.url,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    // Get auth token from localStorage or wherever it's stored
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  async (error) => {
    // Handle response errors
    const { response, config } = error;
    const originalRequest = config;
    
    // Handle 401 Unauthorized errors (token expired, invalid, etc.)
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${config.api.url}/auth/refresh-token`, { refreshToken });
          
          // Update tokens in storage
          localStorage.setItem('auth_token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          
          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle validation errors (422 Unprocessable Entity)
    if (response?.status === 422) {
      const errorData = response.data;
      const validationError = new ValidationError(
        errorData.message || 'Validation failed',
        errorData.errors
      );
      return Promise.reject(validationError);
    }
    
    // Handle other API errors
    if (response?.data) {
      const apiError = new ApiError(
        response.data.message || 'An error occurred',
        response.data.code,
        response.status,
        response.data
      );
      return Promise.reject(apiError);
    }
    
    // Handle network errors
    if (!response) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    // Default error handling
    return Promise.reject(error);
  }
);

/**
 * Make a GET request
 * @param {string} url - The URL to request
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional axios options
 * @returns {Promise} The response data
 */
export const get = async (url, params = {}, options = {}) => {
  try {
    const response = await apiClient.get(url, { params, ...options });
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a POST request
 * @param {string} url - The URL to request
 * @param {Object} data - The request body
 * @param {Object} options - Additional axios options
 * @returns {Promise} The response data
 */
export const post = async (url, data = {}, options = {}) => {
  try {
    const response = await apiClient.post(url, data, options);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a PUT request
 * @param {string} url - The URL to request
 * @param {Object} data - The request body
 * @param {Object} options - Additional axios options
 * @returns {Promise} The response data
 */
export const put = async (url, data = {}, options = {}) => {
  try {
    const response = await apiClient.put(url, data, options);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a PATCH request
 * @param {string} url - The URL to request
 * @param {Object} data - The request body
 * @param {Object} options - Additional axios options
 * @returns {Promise} The response data
 */
export const patch = async (url, data = {}, options = {}) => {
  try {
    const response = await apiClient.patch(url, data, options);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a DELETE request
 * @param {string} url - The URL to request
 * @param {Object} options - Additional axios options
 * @returns {Promise} The response data
 */
export const del = async (url, options = {}) => {
  try {
    const response = await apiClient.delete(url, options);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Upload a file using FormData
 * @param {string} url - The URL to upload to
 * @param {File|Blob} file - The file to upload
 * @param {Object} data - Additional form data
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise} The response data
 */
export const uploadFile = async (url, file, data = {}, onUploadProgress = null) => {
  const formData = new FormData();
  
  // Append the file
  formData.append('file', file);
  
  // Append additional data
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  
  try {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.lengthComputable) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Handle API errors consistently
 * @param {Error} error - The error to handle
 * @returns {Error} The processed error
 */
const handleApiError = (error) => {
  // If it's already an instance of our custom errors, just rethrow
  if (error instanceof ApiError || error instanceof ValidationError) {
    return error;
  }
  
  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;
    
    // Handle validation errors
    if (status === 422) {
      return new ValidationError(
        data.message || 'Validation failed',
        data.errors
      );
    }
    
    // Handle other API errors
    return new ApiError(
      data.message || 'An error occurred',
      data.code,
      status,
      data
    );
  }
  
  // Handle network errors
  if (error.request) {
    const networkError = new Error('Network error. Please check your connection.');
    networkError.isNetworkError = true;
    return networkError;
  }
  
  // Default error handling
  return error;
};

export default apiClient;
