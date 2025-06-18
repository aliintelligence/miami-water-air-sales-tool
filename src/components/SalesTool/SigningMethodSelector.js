import React from 'react';
import { useTranslation } from '../../utils/i18n';

/**
 * iPad-optimized Signing Method Selector component
 * Features improved layout, touch-friendly UI elements, and responsive design
 */
const SigningMethodSelector = ({ 
  signingMethod, 
  setSigningMethod, 
  customerInfo 
}) => {
  const { t } = useTranslation();
  
  // Format phone for display if available
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return t('signingMethod.noPhone');
    return phone;
  };
  
  // Check if we have valid data for each method
  const isEmailValid = customerInfo?.email && customerInfo.email.trim().length > 0;
  const isPhoneValid = customerInfo?.phone && customerInfo.phone.trim().length > 0;
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        {t('signingMethod.title')}
        <span className="ml-2 bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded-full">
          Required
        </span>
      </h3>
      
      <div className="space-y-4">
        {/* Email option */}
        <div 
          className={`signing-method ${signingMethod === 'email' ? 'selected' : ''} ${!isEmailValid ? 'opacity-50' : ''}`}
          onClick={() => isEmailValid && setSigningMethod('email')}
        >
          <div className="signing-method-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="signing-method-info">
            <label htmlFor="signing-email" className="flex flex-col cursor-pointer">
              <span className="text-base font-medium">{t('signingMethod.email')}</span>
              <span className="text-sm text-gray-600">
                {isEmailValid 
                  ? `${t('signingMethod.sendTo')} ${customerInfo.email}`
                  : t('signingMethod.noEmail')}
              </span>
            </label>
          </div>
          
          <input
            type="radio"
            id="signing-email"
            name="signing-method"
            className="h-5 w-5"
            checked={signingMethod === 'email'}
            onChange={() => isEmailValid && setSigningMethod('email')}
            disabled={!isEmailValid}
          />
        </div>
        
        {/* SMS option */}
        <div 
          className={`signing-method ${signingMethod === 'sms' ? 'selected' : ''} ${!isPhoneValid ? 'opacity-50' : ''}`}
          onClick={() => isPhoneValid && setSigningMethod('sms')}
        >
          <div className="signing-method-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="signing-method-info">
            <label htmlFor="signing-sms" className="flex flex-col cursor-pointer">
              <span className="text-base font-medium">{t('signingMethod.sms')}</span>
              <span className="text-sm text-gray-600">
                {isPhoneValid 
                  ? `${t('signingMethod.sendTo')} ${formatPhoneForDisplay(customerInfo.phone)}`
                  : t('signingMethod.noPhone')}
              </span>
              {isPhoneValid && (
                <span className="text-xs text-blue-600 mt-1">
                  {t('signingMethod.smsNote')}
                </span>
              )}
            </label>
          </div>
          
          <input
            type="radio"
            id="signing-sms"
            name="signing-method"
            className="h-5 w-5"
            checked={signingMethod === 'sms'}
            onChange={() => isPhoneValid && setSigningMethod('sms')}
            disabled={!isPhoneValid}
          />
        </div>
      </div>
      
      {/* Information Notes */}
      <div className="mt-4 bg-blue-50 p-4 rounded-xl">
        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {t('signingMethod.notes')}
        </h4>
        
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t('signingMethod.emailInfo')}</span>
          </li>
          
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t('signingMethod.smsInfo')}</span>
          </li>
          
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{t('signingMethod.needInfo')}</span>
          </li>
        </ul>
      </div>
      
      {/* Help Text - Conditional based on selected method */}
      {signingMethod === 'email' && isEmailValid && (
        <div className="mt-4 p-3 bg-green-50 rounded-xl">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800">The customer will receive an email with instructions to electronically sign the document.</p>
              <p className="text-sm text-green-700 mt-1">Make sure the email address is correct and check that the customer has access to this email account.</p>
            </div>
          </div>
        </div>
      )}
      
      {signingMethod === 'sms' && isPhoneValid && (
        <div className="mt-4 p-3 bg-green-50 rounded-xl">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800">The customer will receive a text message with a link to sign the document.</p>
              <p className="text-sm text-green-700 mt-1">Standard SMS rates may apply. The customer will need internet access on their mobile device to complete the signing process.</p>
            </div>
          </div>
        </div>
      )}
      
      {(!isEmailValid && !isPhoneValid) && (
        <div className="mt-4 p-3 bg-red-50 rounded-xl">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">You need to provide either an email address or phone number</p>
              <p className="text-sm text-red-700 mt-1">Please go back to the Customer Information step and add at least one contact method to continue.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SigningMethodSelector;