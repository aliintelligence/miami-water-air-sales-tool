// src/components/SalesTool/TRecommendationSelector.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/i18n';

const TRecommendationSelector = ({ 
  packages = [], 
  financingOptions = [], 
  onSelectRecommendation 
}) => {
  const { t } = useTranslation();
  const [tValue, setTValue] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Helper function to calculate monthly payment
  const calculateMonthlyPayment = (principal, annualRate, termMonths) => {
    // For revolving accounts (like fin2 with 1% payment factor)
    if (termMonths === 0) {
      return principal * 0.01; // 1% payment factor
    }
    
    // For zero interest
    if (annualRate === 0) {
      return principal / termMonths;
    }
    
    // Standard amortization formula
    const monthlyRate = annualRate / 100 / 12;
    const termInMonths = parseInt(termMonths);
    
    if (monthlyRate === 0 || termInMonths === 0) {
      return principal / (termInMonths || 1);
    }
    
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termInMonths);
    const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1;
    
    // Prevent division by zero
    if (denominator === 0) return principal / termInMonths;
    
    return principal * (numerator / denominator);
  };
  
  // Find packages that match the T value (within +/- 20%)
  const findMatchingPackages = (tCost) => {
    if (!packages || !Array.isArray(packages) || !financingOptions || !Array.isArray(financingOptions)) {
      return [];
    }
    
    const numericTCost = parseFloat(tCost);
    if (isNaN(numericTCost) || numericTCost <= 0) {
      return [];
    }
    
    const matches = [];
    const minPayment = numericTCost * 0.8; // 20% below T cost
    const maxPayment = numericTCost * 1.2; // 20% above T cost
    
    // For each package, calculate monthly payments with different financing options
    packages.forEach(pkg => {
      if (!pkg || !pkg.packagePrice) return;
      
      // Check each financing option
      financingOptions.forEach(finOption => {
        if (!finOption) return;
        
        // Skip if no terms available
        if (!finOption.terms || !finOption.terms.length) return;
        
        finOption.terms.forEach(term => {
          // Calculate monthly payment for this combo
          const monthlyPayment = calculateMonthlyPayment(
            pkg.packagePrice, 
            finOption.interestRate || 0, 
            term
          );
          
          // Check if payment is in range
          if (monthlyPayment >= minPayment && monthlyPayment <= maxPayment) {
            matches.push({
              package: pkg,
              financing: finOption,
              term: term,
              monthlyPayment: monthlyPayment
            });
          }
        });
      });
    });
    
    // Sort by how close they are to the T cost
    return matches.sort((a, b) => {
      const diffA = Math.abs(a.monthlyPayment - numericTCost);
      const diffB = Math.abs(b.monthlyPayment - numericTCost);
      return diffA - diffB;
    });
  };
  
  // Handle T value input change
  const handleTValueChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal
    setTValue(value);
  };
  
  // Find recommendations when T value is submitted
  const handleFindRecommendations = (e) => {
    e.preventDefault();
    
    if (!tValue || parseFloat(tValue) <= 0) {
      alert('Please enter a valid T value greater than 0');
      return;
    }
    
    setIsCalculating(true);
    
    // Use setTimeout to allow UI to update before calculation
    setTimeout(() => {
      const matches = findMatchingPackages(tValue);
      setRecommendations(matches);
      setShowRecommendations(true);
      setIsCalculating(false);
    }, 100);
  };
  
  // Handle selecting a recommendation
  const handleSelectRecommendation = (recommendation) => {
    if (onSelectRecommendation) {
      onSelectRecommendation({
        tValue: parseFloat(tValue),
        selectedPackage: recommendation.package,
        selectedFinancing: recommendation.financing,
        selectedTerm: recommendation.term,
        monthlyPayment: recommendation.monthlyPayment
      });
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold mb-4">{t('salesTool.tRecommendations.title')}</h3>
      
      <div className="mb-6">
        <form onSubmit={handleFindRecommendations}>
          <div className="flex items-end space-x-4">
            <div className="flex-grow">
              <label htmlFor="tValue" className="block text-sm font-medium text-gray-700 mb-1">
                {t('salesTool.tRecommendations.enterTValue')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="tValue"
                  name="tValue"
                  value={tValue}
                  onChange={handleTValueChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter amount (e.g. 120)"
                  aria-label="Enter customer's T Value in dollars"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t('salesTool.tRecommendations.description')}
              </p>
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : (
                t('salesTool.tRecommendations.findPackages')
              )}
            </button>
          </div>
        </form>
      </div>
      
      {showRecommendations && (
        <div>
          <h4 className="font-medium text-lg mb-3">{t('salesTool.tRecommendations.recommendedSolutions')}</h4>
          
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((recommendation, index) => (
                <div 
                  key={`${recommendation.package.id}-${recommendation.financing.id}-${recommendation.term}`}
                  className={`border rounded-lg p-4 ${index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h6 className="font-bold text-lg">{recommendation.package.name}</h6>
                      <p className="text-gray-600">
                        {t('salesTool.financing.program')}: {recommendation.financing.name}
                        {recommendation.term > 0 
                          ? `, ${recommendation.term} ${t('salesTool.financing.months', { term: recommendation.term })}` 
                          : ` (${t('salesTool.financing.revolving')})`}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {recommendation.package.items?.length || 0} {t('salesTool.tRecommendations.productsIncluded')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 line-through">
                        ${recommendation.package.individualPrice?.toLocaleString()}
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        ${recommendation.package.packagePrice.toLocaleString()}
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        ${recommendation.monthlyPayment.toFixed(2)}/month
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <button
                      onClick={() => handleSelectRecommendation(recommendation)}
                      className={`w-full py-2 rounded-md font-medium ${
                        index === 0 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {index === 0 ? t('salesTool.tRecommendations.selectBestOption') : t('salesTool.tRecommendations.selectThisOption')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-lg text-yellow-700">
                {t('salesTool.tRecommendations.noMatches')} {tValue}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('salesTool.tRecommendations.tryDifferent')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TRecommendationSelector;