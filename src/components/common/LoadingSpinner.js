// src/components/common/LoadingSpinner.js
import React from 'react';

/**
 * A reusable loading spinner component with different variants
 * @param {Object} props - Component properties
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {string} props.color - Color variant ('primary', 'white', 'green')
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.overlay - Whether to show a full-page overlay
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  message = '', 
  overlay = false 
}) => {
  // Determine size classes
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  // Determine color classes
  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    green: 'text-green-500',
    gray: 'text-gray-500'
  };
  
  // Spinner element
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center">
      <svg 
        className={`animate-spin ${sizeClasses[size] || sizeClasses.medium} ${colorClasses[color] || colorClasses.primary}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {message && (
        <p className={`mt-2 text-${size === 'small' ? 'sm' : 'base'} ${colorClasses[color] || colorClasses.primary}`}>
          {message}
        </p>
      )}
    </div>
  );
  
  // If overlay is true, render with full-page overlay
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          {spinnerElement}
        </div>
      </div>
    );
  }
  
  // Otherwise, just return the spinner
  return spinnerElement;
};

export default LoadingSpinner;