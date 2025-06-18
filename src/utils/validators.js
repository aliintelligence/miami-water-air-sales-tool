// src/utils/validators.js
export const validateCustomerInfo = (customerInfo = {}) => {
  const errors = {};
  
  // First name validation
  if (!customerInfo.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  
  // Last name validation
  if (!customerInfo.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  // Email validation - more robust pattern
  if (!customerInfo.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
    errors.email = 'Email is invalid';
  }
  
  // Phone validation - improved with proper formatting check
  if (!customerInfo.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(customerInfo.phone)) {
    errors.phone = 'Phone number format is invalid (e.g., (305) 555-1234)';
  }
  
  // Address validation
  if (!customerInfo.address?.trim()) {
    errors.address = 'Address is required';
  }
  
  // City validation
  if (!customerInfo.city?.trim()) {
    errors.city = 'City is required';
  }
  
  // State validation
  if (!customerInfo.state?.trim()) {
    errors.state = 'State is required';
  }
  
  // ZIP validation - format check
  if (!customerInfo.zip?.trim()) {
    errors.zip = 'ZIP code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(customerInfo.zip)) {
    errors.zip = 'ZIP code format is invalid (e.g., 12345 or 12345-6789)';
  }
  
  return errors;
};

export const calculateMonthlyPayment = (totalPrice, financingOption, financingTerm, customRate) => {
  if (!financingOption || !financingTerm) return 0;
  const rate = customRate !== null ? customRate : financingOption.interestRate;
  
  if (financingOption.id === 'fin2') {
    // Use payment factor if defined, otherwise default to 1%
    const paymentFactor = typeof financingOption.paymentFactor === 'number' ? 
                         financingOption.paymentFactor : 0.01;
    return totalPrice * paymentFactor;
  }
  
  if (financingOption.id === 'fin1') {
    return totalPrice / parseInt(financingTerm);
  }
  
  const monthlyRate = rate / 100 / 12;
  const termMonths = parseInt(financingTerm);
  
  // Handle edge cases
  if (isNaN(termMonths) || termMonths <= 0) return 0;
  if (monthlyRate === 0) return totalPrice / termMonths;
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  // Avoid division by zero
  if (denominator === 0) return totalPrice / termMonths;
  
  return totalPrice * (numerator / denominator);
};