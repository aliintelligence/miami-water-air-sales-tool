import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../utils/i18n';

/**
 * iPad-optimized Customer Form component
 * Features improved layout, touch-friendly UI elements, and responsive design
 */
const CustomerForm = ({ customerInfo, setCustomerInfo, onBack, onNext }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [showStates, setShowStates] = useState(false);
  const statesListRef = useRef(null);
  const formRef = useRef(null);
  
  // US states for dropdown
  const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  // Close states dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statesListRef.current && !statesListRef.current.contains(event.target)) {
        setShowStates(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Validate form when component mounts or when customerInfo changes
  useEffect(() => {
    const validationErrors = validateCustomerInfo(customerInfo);
    setErrors(validationErrors);
    setIsFormValid(Object.keys(validationErrors).length === 0);
  }, [customerInfo]);
  
  // Validation function
  const validateCustomerInfo = (data = {}) => {
    const newErrors = {};
    
    // First name validation
    if (!data.firstName?.trim()) {
      newErrors.firstName = t('validation.required', 'Required field');
    }
    
    // Last name validation
    if (!data.lastName?.trim()) {
      newErrors.lastName = t('validation.required', 'Required field');
    }
    
    // Email validation - enhanced pattern
    if (!data.email?.trim()) {
      newErrors.email = t('validation.required', 'Required field');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = t('validation.invalidEmail', 'Invalid email format');
    }
    
    // Phone validation - basic format check
    if (!data.phone?.trim()) {
      newErrors.phone = t('validation.required', 'Required field');
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(data.phone)) {
      newErrors.phone = t('validation.phoneFormat', 'Format: (123) 456-7890');
    }
    
    // Address validation
    if (!data.address?.trim()) {
      newErrors.address = t('validation.required', 'Required field');
    }
    
    // City validation
    if (!data.city?.trim()) {
      newErrors.city = t('validation.required', 'Required field');
    }
    
    // State validation
    if (!data.state?.trim()) {
      newErrors.state = t('validation.required', 'Required field');
    }
    
    // ZIP validation - basic format check
    if (!data.zip?.trim()) {
      newErrors.zip = t('validation.required', 'Required field');
    } else if (!/^\d{5}(-\d{4})?$/.test(data.zip)) {
      newErrors.zip = t('validation.zipFormat', 'Format: 12345 or 12345-6789');
    }
    
    return newErrors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  // Handle blur events
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  // Format phone number while typing
  const formatPhoneNumber = (value) => {
    if (!value) return '';
    
    // Strip all non-numeric characters
    const phoneDigits = value.replace(/\D/g, '');
    
    // Format based on length
    if (phoneDigits.length <= 3) {
      return `(${phoneDigits}`;
    } else if (phoneDigits.length <= 6) {
      return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
    } else {
      return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
    }
  };
  
  // Handle phone number input
  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setCustomerInfo(prev => ({
      ...prev,
      phone: formattedPhoneNumber
    }));
    
    setTouched(prev => ({
      ...prev,
      phone: true
    }));
  };
  
  // Handle state selection
  const handleStateSelect = (stateValue) => {
    setCustomerInfo(prev => ({
      ...prev,
      state: stateValue
    }));
    
    setTouched(prev => ({
      ...prev,
      state: true
    }));
    
    setShowStates(false);
  };
  
  // Auto-populate city and state when ZIP is entered
  const handleZipBlur = async (e) => {
    handleBlur(e);
    const zip = e.target.value.trim();
    
    // Only process if we have a valid ZIP and city/state are empty
    if (zip && zip.length === 5 && (!customerInfo.city || !customerInfo.state)) {
      try {
        // This is a simple placeholder - in a real app you'd use a geocoding service
        // or ZIP code database API
        if (zip.startsWith('33')) {
          // Miami area ZIP codes
          setCustomerInfo(prev => ({
            ...prev,
            city: 'Miami',
            state: 'FL'
          }));
          
          setTouched(prev => ({
            ...prev,
            city: true,
            state: true
          }));
        } else if (zip.startsWith('32')) {
          // Orlando area
          setCustomerInfo(prev => ({
            ...prev,
            city: 'Orlando',
            state: 'FL'
          }));
          
          setTouched(prev => ({
            ...prev,
            city: true,
            state: true
          }));
        } else if (zip.startsWith('34')) {
          // Tampa area
          setCustomerInfo(prev => ({
            ...prev,
            city: 'Tampa',
            state: 'FL'
          }));
          
          setTouched(prev => ({
            ...prev,
            city: true,
            state: true
          }));
        }
        // Add more ZIP code lookups as needed
      } catch (error) {
        console.error('Error looking up ZIP code:', error);
      }
    }
  };
  
  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(customerInfo).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate the form
    const validationErrors = validateCustomerInfo(customerInfo);
    setErrors(validationErrors);
    
    // If no errors, proceed to next step
    if (Object.keys(validationErrors).length === 0) {
      onNext();
    } else {
      // Scroll to first error for better UX
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Get field class based on error state
  const getFieldClass = (fieldName) => {
    return `input-field ${touched[fieldName] && errors[fieldName] ? 'error-field border-red-500' : 'border-gray-300'}`;
  };
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{t('salesTool.customer.title')}</h3>
      
      <form ref={formRef} onSubmit={handleSubmit} className="customer-form mb-24">
        <div className={`form-grid ${isPortrait ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              {t('salesTool.customer.firstName')}
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={customerInfo.firstName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('firstName')}
              autoComplete="given-name"
            />
            {touched.firstName && errors.firstName && (
              <p className="error-message">{errors.firstName}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              {t('salesTool.customer.lastName')}
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={customerInfo.lastName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('lastName')}
              autoComplete="family-name"
            />
            {touched.lastName && errors.lastName && (
              <p className="error-message">{errors.lastName}</p>
            )}
          </div>
          
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('salesTool.customer.email')}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={customerInfo.email || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('email')}
              autoComplete="email"
              inputMode="email"
            />
            {touched.email && errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>
          
          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              {t('salesTool.customer.phone')}
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={customerInfo.phone || ''}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              className={getFieldClass('phone')}
              autoComplete="tel"
              inputMode="tel"
              placeholder="(305) 555-1234"
            />
            {touched.phone && errors.phone && (
              <p className="error-message">{errors.phone}</p>
            )}
          </div>
          
          {/* Address */}
          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">
              {t('salesTool.customer.address')}
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={customerInfo.address || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('address')}
              autoComplete="street-address"
            />
            {touched.address && errors.address && (
              <p className="error-message">{errors.address}</p>
            )}
          </div>
          
          {/* City */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              {t('salesTool.customer.city')}
            </label>
            <input
              id="city"
              type="text"
              name="city"
              value={customerInfo.city || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClass('city')}
              autoComplete="address-level2"
            />
            {touched.city && errors.city && (
              <p className="error-message">{errors.city}</p>
            )}
          </div>
          
          {/* State - Custom Dropdown for better iPad UX */}
          <div className="form-group relative" ref={statesListRef}>
            <label htmlFor="state" className="form-label">
              {t('salesTool.customer.state')}
            </label>
            <div 
              className={`input-field flex items-center justify-between cursor-pointer ${getFieldClass('state').replace('input-field', '')}`}
              onClick={() => setShowStates(!showStates)}
            >
              <span className={customerInfo.state ? 'text-gray-900' : 'text-gray-400'}>
                {customerInfo.state || t('salesTool.customer.selectState')}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${showStates ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {showStates && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white border-b">
                  <input
                    type="text"
                    placeholder="Search states..."
                    className="w-full p-2 border border-gray-300 rounded"
                    onChange={(e) => {
                      // Filter states list (could be implemented)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="py-1">
                  {states.map(state => (
                    <div
                      key={state.value}
                      className={`px-4 py-3 hover:bg-blue-50 cursor-pointer ${customerInfo.state === state.value ? 'bg-blue-100' : ''}`}
                      onClick={() => handleStateSelect(state.value)}
                    >
                      {state.label} ({state.value})
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {touched.state && errors.state && (
              <p className="error-message">{errors.state}</p>
            )}
          </div>
          
          {/* ZIP Code */}
          <div className="form-group">
            <label htmlFor="zip" className="form-label">
              {t('salesTool.customer.zip')}
            </label>
            <input
              id="zip"
              type="text"
              name="zip"
              value={customerInfo.zip || ''}
              onChange={handleChange}
              onBlur={handleZipBlur}
              className={getFieldClass('zip')}
              autoComplete="postal-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="10"
            />
            {touched.zip && errors.zip && (
              <p className="error-message">{errors.zip}</p>
            )}
          </div>
        </div>
      </form>
      
      {/* Form Tips */}
      <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-blue-800 font-medium">Tips:</p>
            <ul className="list-disc ml-4 mt-1 text-blue-700 space-y-1">
              <li>Enter the ZIP code first to auto-fill city and state when possible</li>
              <li>Phone numbers will format automatically as you type</li>
              <li>All fields are required to proceed to the next step</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Fixed navigation */}
      <div className="bottom-nav safe-bottom">
        <button 
          type="button"
          onClick={onBack}
          className="btn-secondary"
        >
          {t('navigation.back')}
        </button>
        
        <button 
          type="button"
          onClick={handleSubmit}
          className={`btn-primary ${!isFormValid ? 'opacity-75' : ''}`}
        >
          {t('salesTool.customer.nextButton')}
        </button>
      </div>
    </div>
  );
};

export default CustomerForm;