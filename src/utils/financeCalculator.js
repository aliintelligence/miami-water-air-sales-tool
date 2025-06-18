// utils/financeCalculator.js

/**
 * Calculate monthly payment based on loan parameters
 * @param {number} principal - Total loan amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {string} termMonths - Loan term in months
 * @param {string} financingType - ID of the financing type
 * @returns {number} Monthly payment amount
 */
export const calculateMonthlyPayment = (principal, annualRate, termMonths, financingType) => {
    // Convert term to a number
    const term = parseInt(termMonths);
    
    // For ISPC revolving account (1% payment factor)
    if (financingType === 'fin2') {
      return principal * 0.01;
    }
    
    // For 0% financing (no interest)
    if (annualRate === 0) {
      return principal / term;
    }
    
    // Standard amortization formula for other financing options
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) {
      return principal / term;
    }
    
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, term);
    const denominator = Math.pow(1 + monthlyRate, term) - 1;
    
    return principal * (numerator / denominator);
  };
  
  /**
   * Calculate total interest paid over the life of the loan
   * @param {number} principal - Total loan amount
   * @param {number} monthlyPayment - Monthly payment amount
   * @param {number} termMonths - Loan term in months
   * @returns {number} Total interest paid
   */
  export const calculateTotalInterest = (principal, monthlyPayment, termMonths) => {
    const totalPaid = monthlyPayment * parseInt(termMonths);
    return totalPaid - principal;
  };
  
  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };