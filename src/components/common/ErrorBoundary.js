// src/components/common/ErrorBoundary.js
import React, { Component } from 'react';

/**
 * ErrorBoundary component to catch and display errors gracefully
 * Wrap your components with this to prevent the entire app from crashing
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  // Catch errors in any child components
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Log error details when they occur
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Optional: Send error to logging service
    // logErrorToService(error, errorInfo);
  }
  
  // Reset the error state to allow recovery
  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;
    
    // If there's an error, render fallback UI
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return React.cloneElement(fallback, {
          error: error,
          resetError: this.resetError
        });
      }
      
      // Default error UI
      return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">
            The application encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    // If no error, render children components normally
    return children;
  }
}

export default ErrorBoundary;