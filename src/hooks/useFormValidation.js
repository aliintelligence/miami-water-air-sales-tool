// hooks/useFormValidation.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A flexible form validation hook that handles validation, state management,
 * and form submission for React forms.
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Optional custom validation function
 * @returns {Object} Form state and handling functions
 */
export const useFormValidation = (initialValues = {}, validateFn = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const isInitialMount = useRef(true);
  
  // Only update values from external source on initial mount or explicit external changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Only update if there's a real change to avoid infinite loops
      if (JSON.stringify(initialValues) !== JSON.stringify(values)) {
        setValues(initialValues);
      }
    }
  }, [initialValues, values]);

  /**
   * Default validation function for customer information
   */
  const validateCustomerInfo = useCallback((data = {}) => {
    const newErrors = {};
    
    // First name validation
    if (!data.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!data.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Email validation - enhanced pattern
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation - basic format check
    if (!data.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9()\-\s.+]+$/.test(data.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    // Address validation
    if (!data.address?.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // City validation
    if (!data.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    // State validation
    if (!data.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    // ZIP validation - basic format check
    if (!data.zip?.trim()) {
      newErrors.zip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(data.zip)) {
      newErrors.zip = 'ZIP code format is invalid (e.g., 12345 or 12345-6789)';
    }
    
    return newErrors;
  }, []);

  /**
   * Handle form field changes
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  /**
   * Handle field blur events
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  /**
   * Set a specific field's value programmatically
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Set multiple field values at once
   */
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  /**
   * Mark specific fields as touched
   */
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  /**
   * Mark all fields as touched
   */
  const setAllTouched = useCallback(() => {
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
  }, [values]);

  /**
   * Validate form and handle submission
   */
  const handleSubmit = useCallback((onSubmit) => {
    return (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      
      setAllTouched();
      setIsSubmitting(true);
      setSubmitCount(prev => prev + 1);
      
      // Determine if we should proceed with submission
      if (isValid) {
        onSubmit(values);
      }
      
      setIsSubmitting(false);
    };
  }, [setAllTouched, isValid, values]);

  /**
   * Reset form to initial values or provided new values
   */
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Run validation when values change or on submit
  useEffect(() => {
    const timer = setTimeout(() => {
      // Use custom validation function if provided, otherwise use default
      const validationFn = validateFn || validateCustomerInfo;
      const validationErrors = validationFn(values);
      
      setErrors(validationErrors);
      setIsValid(Object.keys(validationErrors).length === 0);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [values, validateFn, validateCustomerInfo, submitCount]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setTouched,
    setFieldValue,
    setFieldValues,
    setFieldTouched,
    setAllTouched,
    resetForm
  };
};