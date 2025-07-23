// src/components/common/Spinner.js
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * A customizable loading spinner component
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner (sm, md, lg, xl)
 * @param {string} [props.color='primary'] - Color of the spinner (primary, secondary, danger, success, warning, info)
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Spinner component
 */
const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  // Size mapping
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  // Color mapping
  const colorMap = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    danger: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    info: 'text-blue-400',
    light: 'text-gray-300',
    dark: 'text-gray-800',
  };

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading..."
    >
      <Loader2 
        className={`animate-spin ${sizeMap[size] || sizeMap.md} ${colorMap[color] || colorMap.primary}`} 
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
