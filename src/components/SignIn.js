// src/components/SignIn.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../utils/i18n';
import LoadingSpinner from './common/LoadingSpinner';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) errors.email = t('validation.required', 'Required');
    if (!password.trim()) errors.password = t('validation.required', 'Required');
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      console.error('Sign in error:', err);
      setError(t('auth.errors.signInFailed', 'Failed to sign in. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  // Normal Sign In Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">{t('app.title', 'Miami Water & Air')}</h1>
          <p className="text-gray-600 mt-2">{t('app.subtitle', 'Sales Quote Generator')}</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center">{t('auth.signIn', 'Sign In')}</h2>
        
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email', 'Email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('auth.enterEmail', 'Enter your email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password', 'Password')}
            </label>
            <input
              id="password"
              type="password"
              placeholder={t('auth.enterPassword', 'Enter your password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.signingIn', 'Signing in...') : t('auth.signIn', 'Sign In')}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">{t('error', 'Error')}:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{t('auth.testCredentials', 'Test credentials: admin@miamiwaterandair.com / password')}</p>
          <p className="mt-2">{t('auth.support', 'Having trouble? Email support@miamiwaterandair.com')}</p>
        </div>
      </div>
    </div>
  );
}