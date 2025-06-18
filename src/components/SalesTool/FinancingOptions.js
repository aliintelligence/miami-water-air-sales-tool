import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../utils/i18n';
import PriceEditor from './PriceEditor';

/**
 * iPad-optimized Financing Options component
 * Features improved layout, touch-friendly UI elements, and responsive design
 */
const FinancingOptions = ({ 
  totalPrice, 
  discountedPrice,
  onPriceChange,
  financingOption, 
  setFinancingOption, 
  financingTerm, 
  setFinancingTerm, 
  customRate, 
  setCustomRate,
  financingOptionsData = [],
  onBack,
  onNext
}) => {
  const { t } = useTranslation();
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [showTermsExplainer, setShowTermsExplainer] = useState(false);

  // Get the effective price (discounted or original)
  const effectivePrice = discountedPrice !== null ? discountedPrice : totalPrice;

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

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    // Ensure financingOption object and term/rate are valid before calculating
    if (!financingOption || (!financingTerm && financingOption.id !== 'fin2')) return 0; 
    
    // Use customRate if set, otherwise use rate from the selected option object
    const rate = customRate !== null && customRate !== undefined ? customRate : (financingOption.interestRate ?? 0);
    const term = parseInt(financingTerm, 10); // Ensure term is integer

    // For ISPC revolving account (assuming ID 'fin2' is stable or configured)
    if (financingOption.id === 'fin2') {
      // Check if a specific payment factor is stored, otherwise use default
      const factor = typeof financingOption.paymentFactor === 'number' ? financingOption.paymentFactor : 0.01;
      return effectivePrice * factor; 
    }
    
    // For no interest financing
    if (rate === 0) {
      // Ensure term is positive to avoid division by zero or infinity
      return term > 0 ? effectivePrice / term : 0; 
    }
    
    // Standard amortization formula
    const monthlyRate = rate / 100 / 12;
    // Ensure term is positive for calculation
    if (term <= 0) return 0; 

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, term);
    const denominator = Math.pow(1 + monthlyRate, term) - 1;

    // Handle potential division by zero if denominator is 0 (e.g., rate is extremely low)
    if (denominator === 0) return 0; 
    
    return effectivePrice * (numerator / denominator);
  };
  
  const monthlyPayment = calculateMonthlyPayment();
  
  // Handle financing option change
  const handleFinancingSelect = (optionId) => {
    const selectedOpt = financingOptionsData.find(opt => opt.id === optionId);
    if (selectedOpt) {
        setFinancingOption(selectedOpt);
        // If option has only one term, auto-select it
        // Handle the case where terms might be [0] for revolving
        if (Array.isArray(selectedOpt.terms) && selectedOpt.terms.length === 1 && selectedOpt.terms[0] !== 0) {
          setFinancingTerm(selectedOpt.terms[0].toString());
        } else if (selectedOpt.id === 'fin2') { // Auto-select for ISPC type
             setFinancingTerm('0'); // Use '0' or specific identifier for revolving
        } else {
          setFinancingTerm(null); // Require manual term selection otherwise
        }
        setCustomRate(null); // Reset custom rate when changing financing
    }
  };

  // Handle Term selection change
  const handleTermChange = (termValue) => {
    setFinancingTerm(termValue || null); // Set to null if empty string selected
  };

  // Format term for display
  const formatTermDisplay = (termValue) => {
    const termNum = parseInt(termValue, 10);
    if (isNaN(termNum) || termNum <= 0) return t('salesTool.financing.revolving'); // Handle 0 or invalid
    if (termNum % 12 === 0) {
      const years = termNum / 12;
      return `${years} ${years > 1 ? 'years' : 'year'} (${termNum} months)`;
    }
    return t('salesTool.financing.months', { term: termNum });
  };

  // Can proceed to next step?
  const canProceed = financingOption && (financingTerm || financingOption.id === 'fin2');
  
  // Show the terms explainer modal
  const toggleTermsExplainer = () => {
    setShowTermsExplainer(prev => !prev);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{t('salesTool.financing.title')}</h3>
      
      <div className="mb-6">
        {/* Price Editor Section */}
        <div className="bg-white p-5 rounded-2xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium">{t('salesTool.priceEditor.currentPrice')}</h4>
            {!isEditingPrice && (
              <button 
                onClick={() => setIsEditingPrice(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg"
              >
                {t('salesTool.priceEditor.edit')}
              </button>
            )}
          </div>
          
          {isEditingPrice ? (
            <PriceEditor 
              originalPrice={totalPrice}
              discountedPrice={discountedPrice}
              onPriceChange={(newPrice, reason) => {
                onPriceChange(newPrice, reason);
                setIsEditingPrice(false);
              }}
              onCancel={() => setIsEditingPrice(false)}
            />
          ) : (
            <div className="flex justify-between items-baseline p-4 bg-gray-50 rounded-xl">
              {discountedPrice !== null ? (
                <div className="flex-1">
                  <div className="text-sm text-gray-500 line-through">
                    {t('salesTool.priceEditor.originalPrice')}: ${totalPrice.toLocaleString()}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${discountedPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">
                    {t('salesTool.priceEditor.specialDiscount')}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  ${totalPrice.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`grid grid-cols-1 ${isPortrait ? 'gap-6' : 'md:grid-cols-2 gap-6'}`}>
          {/* Financing Company Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h4 className="text-lg font-medium mb-4">{t('salesTool.financing.company')}</h4>
            <div className="space-y-4">
              {financingOptionsData.map(option => (
                <div 
                  key={option.id} 
                  className={`financing-option ${financingOption?.id === option.id ? 'selected' : ''}`}
                  onClick={() => handleFinancingSelect(option.id)}
                >
                  <div className="financing-option-header">
                    <div className="financing-name">{option.name}</div>
                    <input
                      type="radio"
                      id={option.id}
                      name="financing"
                      className="h-5 w-5"
                      checked={financingOption?.id === option.id}
                      onChange={() => handleFinancingSelect(option.id)}
                    />
                  </div>
                  
                  <p className="text-gray-600 mt-1">{option.description}</p>
                  
                  {option.interestRate > 0 ? (
                    <div className="mt-2 text-blue-600 font-medium">{option.interestRate}% APR</div>
                  ) : option.interestRate === 0 ? (
                    <div className="mt-2 text-green-600 font-medium">0% APR Available!</div>
                  ) : null}
                  
                  {/* Display available terms if option is selected */}
                  {financingOption?.id === option.id && Array.isArray(option.terms) && option.terms.length > 0 && option.id !== 'fin2' && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-base font-medium">{t('salesTool.financing.termLength')}</h5>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleTermsExplainer(); 
                          }}
                          className="text-blue-600 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          About Terms
                        </button>
                      </div>
                      
                      <div className="term-selector">
                        {option.terms.map(term => (
                          <div 
                            key={term} 
                            className={`term-option ${financingTerm === term.toString() ? 'selected' : ''}`}
                            onClick={(e) => { 
                              e.stopPropagation();
                              handleTermChange(term.toString());
                            }}
                          >
                            {formatTermDisplay(term)}
                          </div>
                        ))}
                      </div>
                      
                      {!financingTerm && (
                        <p className="text-red-500 text-sm mt-2">{t('salesTool.financing.pleaseSelect')}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Rate and Payment Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h4 className="text-lg font-medium mb-4">{t('salesTool.financing.customRate')}</h4>
            
            <div className="space-y-5">
              {/* Custom Interest Rate Input */}
              <div>
                <label className="block mb-2 text-base font-medium">{t('salesTool.financing.interestRate')}</label>
                <div className="flex rounded-lg overflow-hidden shadow-sm">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={financingOption ? t('salesTool.financing.defaultRate', { rate: financingOption.interestRate }) : t('salesTool.financing.selectPlanFirst')}
                    value={customRate !== null ? customRate : ''}
                    onChange={(e) => setCustomRate(e.target.value ? parseFloat(e.target.value) : null)}
                    className="flex-1 p-3 text-lg border-y border-l border-gray-300 rounded-l-lg"
                    disabled={!financingOption}
                    min="0" max="50"
                  />
                  <div className="bg-gray-100 flex items-center px-4 border-y border-r border-gray-300 rounded-r-lg">
                    <span className="text-gray-600 text-lg">%</span>
                  </div>
                </div>
              </div>
              
              {/* Show payment summary if calculation is possible */}
              {financingOption && (financingTerm || financingOption.id === 'fin2') && monthlyPayment > 0 && (
                <div className="payment-summary">
                  <h5 className="font-medium text-center text-white text-lg mb-4">{t('salesTool.financing.paymentSummary')}</h5>
                  
                  <div className="payment-amount">
                    ${monthlyPayment.toFixed(2)}/mo
                  </div>
                  
                  <div className="payment-details">
                    <div className="payment-detail-item">
                      <div className="text-sm text-white opacity-80">{t('salesTool.financing.program')}</div>
                      <div className="font-semibold text-white truncate">{financingOption.name}</div>
                    </div>
                    
                    <div className="payment-detail-item">
                      <div className="text-sm text-white opacity-80">{t('salesTool.financing.interestRate')}</div>
                      <div className="font-semibold text-white">
                        {customRate !== null ? customRate : financingOption.interestRate}%
                      </div>
                    </div>
                    
                    <div className="payment-detail-item">
                      <div className="text-sm text-white opacity-80">{t('salesTool.financing.term')}</div>
                      <div className="font-semibold text-white">
                        {financingOption.id === 'fin2' 
                          ? t('salesTool.financing.revolving')
                          : t('salesTool.financing.months', { term: financingTerm })}
                      </div>
                    </div>
                    
                    {/* Show total cost only for non-revolving loans with a term */}
                    {financingOption.id !== 'fin2' && financingTerm && parseInt(financingTerm, 10) > 0 && (
                      <div className="payment-detail-item">
                        <div className="text-sm text-white opacity-80">{t('salesTool.financing.totalCost')}</div>
                        <div className="font-semibold text-white">
                          ${(monthlyPayment * parseInt(financingTerm, 10)).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Information box with financing details */}
        {financingOption && (
          <div className="mt-5 bg-blue-50 p-5 rounded-2xl shadow">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 text-lg mb-2">
                  {t('salesTool.financing.about', { name: financingOption.name })}
                </h5>
                <p className="text-blue-700 mb-3">{financingOption.description}</p>
                
                {/* Conditional disclaimers based on financing type */}
                <div className="text-sm text-blue-600 bg-white bg-opacity-50 p-3 rounded-xl">
                  {financingOption.id === 'fin1' && t('salesTool.financing.disclaimers.zeroApr')}
                  {financingOption.id === 'fin2' && t('salesTool.financing.disclaimers.revolving')}
                  {(financingOption.id === 'fin3' || financingOption.id === 'fin4') && t('salesTool.financing.disclaimers.longTerm')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terms Explainer Modal */}
      {showTermsExplainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Understanding Loan Terms</h4>
              <button 
                onClick={toggleTermsExplainer}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <section>
                <h5 className="font-medium text-lg text-blue-700">What is a term length?</h5>
                <p className="text-gray-700">
                  The term length is the duration of your loan, typically expressed in months. It determines how long you'll be making payments and affects your monthly payment amount.
                </p>
              </section>
              
              <section>
                <h5 className="font-medium text-lg text-blue-700">How does term length affect my payment?</h5>
                <p className="text-gray-700">
                  Longer terms generally result in lower monthly payments but may cost more in total interest over the life of the loan. Shorter terms typically have higher monthly payments but cost less in total interest.
                </p>
              </section>
              
              <section>
                <h5 className="font-medium text-lg text-blue-700">What is a revolving account?</h5>
                <p className="text-gray-700">
                  A revolving account (like a credit card) has no fixed term. You make minimum monthly payments based on your balance, and you can continue to borrow as you pay off the balance, up to your credit limit.
                </p>
              </section>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={toggleTermsExplainer}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed navigation */}
      <div className="bottom-nav safe-bottom">
        <button 
          onClick={onBack} 
          className="btn-secondary"
        >
          {t('navigation.back')}
        </button>
        
        <button 
          onClick={onNext} 
          disabled={!canProceed} 
          className={`px-6 py-3 rounded-xl text-lg font-medium shadow-md
            ${canProceed 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-500'}`}
        >
          {t('salesTool.financing.nextButton')}
        </button>
      </div>
    </div>
  );
};

export default FinancingOptions;