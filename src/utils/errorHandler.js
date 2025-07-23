// src/utils/errorHandler.js
import { toast } from 'react-hot-toast';

/**
 * Error codes and their corresponding user-friendly messages
 */
const ERROR_MESSAGES = {
  // Authentication errors (1000-1099)
  1000: 'Invalid email or password',
  1001: 'Email already in use',
  1002: 'Invalid or expired authentication token',
  1003: 'Authentication required',
  1004: 'Account not verified',
  1005: 'Invalid verification token',
  
  // Validation errors (2000-2099)
  2000: 'Validation failed',
  2001: 'Invalid email format',
  2002: 'Password too weak',
  2003: 'Passwords do not match',
  2004: 'Invalid input data',
  
  // Resource errors (3000-3099)
  3000: 'Resource not found',
  3001: 'Access denied',
  3002: 'Operation not permitted',
  3003: 'Resource already exists',
  
  // Rate limiting and throttling (4000-4099)
  4000: 'Too many requests. Please try again later.',
  
  // Server errors (5000-5099)
  5000: 'Internal server error',
  5001: 'Service unavailable',
  5002: 'Database error',
  
  // Default error message
  default: 'An unexpected error occurred. Please try again.',
};

/**
 * Get a user-friendly error message from an error code or error object
 * @param {Error|string|number} error - The error object, error message, or error code
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.default;
  
  // Handle error code (number)
  if (typeof error === 'number') {
    return ERROR_MESSAGES[error] || ERROR_MESSAGES.default;
  }
  
  // Handle error object with code
  if (error.code && typeof error.code === 'number') {
    return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES.default;
  }
  
  // Handle error object with status
  if (error.status && typeof error.status === 'number') {
    const statusCode = error.status;
    
    // Map HTTP status codes to error messages
    const statusMessages = {
      400: error.data?.message || 'Bad request',
      401: 'Unauthorized. Please log in.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      408: 'Request timeout. Please try again.',
      409: 'A conflict occurred. Please try again.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'An internal server error occurred. Please try again later.',
      502: 'Bad gateway. The server is currently unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. The server took too long to respond.',
    };
    
    return statusMessages[statusCode] || error.message || ERROR_MESSAGES.default;
  }
  
  // Handle error object with message
  if (error.message) {
    // Check if the message is a JSON string
    try {
      const parsedError = JSON.parse(error.message);
      if (parsedError.message) {
        return parsedError.message;
      }
    } catch (e) {
      // Not a JSON string, continue with the original message
    }
    
    return error.message;
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return ERROR_MESSAGES.default;
};

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {Object} options - Additional options
 * @param {boolean} [options.showToast=true] - Whether to show a toast notification
 * @param {string} [options.defaultMessage] - Default error message if none is found
 * @param {Function} [options.onError] - Callback function to handle the error
 * @returns {string} The error message
 */
export const handleError = (error, options = {}) => {
  const { 
    showToast = true, 
    defaultMessage = ERROR_MESSAGES.default,
    onError 
  } = options;
  
  const errorMessage = getErrorMessage(error) || defaultMessage;
  
  // Show toast notification if enabled
  if (showToast && typeof window !== 'undefined') {
    toast.error(errorMessage);
  }
  
  // Log the error to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  
  // Call the onError callback if provided
  if (typeof onError === 'function') {
    onError(error, errorMessage);
  }
  
  return errorMessage;
};

/**
 * Create a custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, code, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Create a custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message || 'Validation failed');
    this.name = 'ValidationError';
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.status = 422;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Format validation errors from a form library or API response
 * @param {Object|Array} errors - The validation errors
 * @returns {Object} Formatted errors
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return {};
  
  // Handle array of errors
  if (Array.isArray(errors)) {
    return errors.reduce((acc, error) => {
      if (error.path) {
        acc[error.path] = error.message;
      }
      return acc;
    }, {});
  }
  
  // Handle object with field errors
  if (typeof errors === 'object') {
    return Object.entries(errors).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value[0]; // Take the first error message
      } else if (typeof value === 'string') {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
  
  return {};
};
