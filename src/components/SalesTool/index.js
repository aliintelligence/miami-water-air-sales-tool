// src/components/SalesTool/index.js - Updated with PDF, SignNow integration and SMS signing
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { calculateMonthlyPayment } from '../../utils/financeCalculator';
import { useTranslation } from '../../utils/i18n';
import { usePdfGenerator } from '../../hooks/usePdfGenerator';
import { useSignNow } from '../../hooks/useSignNow';
import { useMongoBackend } from '../../hooks/useMongoBackend';

// Component Imports
import EquipmentSelector from './EquipmentSelector';
import PackageSelector from './PackageSelector';
import TRecommendationSelector from './TRecommendationSelector';
import FinancingOptions from './FinancingOptions';
import CustomerForm from './CustomerForm';
import OrderSummary from './OrderSummary';
import SuccessModal from './SuccessModal';
import SigningMethodSelector from './SigningMethodSelector';


// Helper function to check if SignNow environment is properly configured
const checkSignNowConfig = () => {
  const requiredVars = [
    'REACT_APP_SIGNNOW_CLIENT_ID',
    'REACT_APP_SIGNNOW_CLIENT_SECRET', 
    'REACT_APP_SIGNNOW_USERNAME',
    'REACT_APP_SIGNNOW_PASSWORD'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !process.env[varName] || process.env[varName].trim() === ''
  );
  
  if (missingVars.length > 0) {
    console.warn(`[SignNow] Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

export default function SalesTool() {
  // Get translation function
  const { t } = useTranslation();
  
  // PDF and SignNow hooks
  const { fillPdfForm, downloadPdf } = usePdfGenerator();
  const { processDocument, isProcessing: isSignNowProcessing, result: signNowResult } = useSignNow();
  
  // State management
  const [step, setStep] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showTRecommendations, setShowTRecommendations] = useState(false);
  const [financingOption, setFinancingOption] = useState(null);
  const [financingTerm, setFinancingTerm] = useState(null);
  const [customRate, setCustomRate] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: ''
  });
  
  // SignNow integration state
  const [signingMethod, setSigningMethod] = useState('email');
  
  // Price editing state
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [discountReason, setDiscountReason] = useState('');
  const [discountManagerApproval, setDiscountManagerApproval] = useState(false);
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [showPresentationView, setShowPresentationView] = useState(false);
  const [result, setResult] = useState(null);

  // Get catalog data
  const { catalog, packages, financingOptions } = useMongoBackend();

  // Handle screen orientation changes
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Reset discounted price when equipment or package changes
  useEffect(() => {
    setDiscountedPrice(null);
    setDiscountReason('');
  }, [selectedEquipment, selectedPackage]);

  // Helper calculations
  const calculateTotalPriceInternal = () => {
    if (selectedPackage && selectedPackage.packagePrice !== undefined) {
      return selectedPackage.packagePrice;
    }
    
    if (!selectedEquipment || !Array.isArray(selectedEquipment)) {
      return 0;
    }
    
    const hasCond = selectedEquipment.some(item => item && item.category === 'conditioner');
    const hasFilt = selectedEquipment.some(item => item && item.category === 'filter');
    
    if (hasCond && hasFilt) {
      return selectedEquipment.reduce((sum, item) => {
        if (!item) return sum;
        return sum + (
          item.packagePrice !== undefined && item.category !== 'conditioner' 
            ? item.packagePrice 
            : (item.price || 0)
        );
      }, 0);
    } else {
      return selectedEquipment.reduce((sum, item) => {
        if (!item) return sum;
        return sum + (item.price || 0);
      }, 0);
    }
  };

  // Get effective price (either discounted or original)
  const getEffectivePrice = () => {
    const originalPrice = calculateTotalPriceInternal();
    return discountedPrice !== null ? discountedPrice : originalPrice;
  };

  const getMonthlyPaymentInternal = () => {
    if (typeof calculateMonthlyPayment !== 'function') return 0;
    
    if (!financingOption) return 0;
    if (financingOption.id !== 'fin2' && (!financingTerm || financingTerm === '0')) return 0;
    
    const price = getEffectivePrice();
    if (!price || price <= 0) return 0;
    
    return calculateMonthlyPayment(price, customRate !== null ? customRate : financingOption.interestRate || 0, financingTerm, financingOption.id);
  };

  // Memoized calculations
  const hasConditioner = useMemo(() => 
    Array.isArray(selectedEquipment) && 
    selectedEquipment.some(item => item && item.category === 'conditioner'), 
  [selectedEquipment]);
  
  const hasFilter = useMemo(() => 
    Array.isArray(selectedEquipment) && 
    selectedEquipment.some(item => item && item.category === 'filter'), 
  [selectedEquipment]);
  
  const allEquipment = useMemo(() => {
    if (!catalog || typeof catalog !== 'object') return [];
    const list = [];
    for (const key in catalog) {
      if (Array.isArray(catalog[key])) {
        catalog[key].forEach(item => { 
          if (item && item.id) list.push({ ...item, categoryKey: key }); 
        });
      }
    }
    return list;
  }, [catalog]);

  // Event handlers
  const handleSelectPackage = useCallback((pkg) => {
    setSelectedPackage(pkg);
    setShowPackageModal(false);
    setFinancingOption(null);
    setFinancingTerm(null);
    setCustomRate(null);
    // Reset any discounts when switching packages
    setDiscountedPrice(null);
    setDiscountReason('');
  }, []);

  // Handler for T recommendations
  const handleTRecommendation = useCallback((recommendation) => {
    setSelectedPackage(recommendation.selectedPackage);
    setFinancingOption(recommendation.selectedFinancing);
    setFinancingTerm(recommendation.selectedTerm.toString());
    setCustomRate(recommendation.selectedFinancing.interestRate);
    setShowTRecommendations(false);
    // Reset any discounts when using recommendations
    setDiscountedPrice(null);
    setDiscountReason('');
    // Optionally move to next step automatically
    setStep(2);
  }, []);

  // Handle price changes from the price editor
  const handlePriceChange = useCallback((newPrice, reason) => {
    const originalPrice = calculateTotalPriceInternal();
    
    // Only set discounted price if it's different from original
    if (newPrice !== originalPrice) {
      setDiscountedPrice(newPrice);
      setDiscountReason(reason || '');
      
      // Calculate discount percentage for tracking/analytics
      const discountPercentage = ((originalPrice - newPrice) / originalPrice) * 100;
      console.log(`Discount applied: ${discountPercentage.toFixed(2)}% ($${(originalPrice - newPrice).toFixed(2)})`);
      
      // Check if manager approval is needed (e.g., discounts > 10%)
      if (discountPercentage > 10 && !discountManagerApproval) {
        setDiscountManagerApproval(true);
      }
    } else {
      // Reset discount if price matches original
      setDiscountedPrice(null);
      setDiscountReason('');
      setDiscountManagerApproval(false);
    }
  }, [calculateTotalPriceInternal, discountManagerApproval]);

  // Form submission with PDF generation and SignNow integration
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Check if manager approval is required but not given
    if (discountManagerApproval) {
      const confirmed = window.confirm(t('salesTool.priceEditor.managerApprovalNeeded'));
      if (!confirmed) {
        return; // Don't proceed if not approved
      }
    }
    
    // Validate that we have the right information for the chosen signing method
    if (signingMethod === 'email' && (!customerInfo.email || !customerInfo.email.trim())) {
      alert('Email address is required to send signing requests via email.');
      return;
    }
    
    if (signingMethod === 'sms' && (!customerInfo.phone || !customerInfo.phone.trim())) {
      alert('Phone number is required to send signing requests via SMS.');
      return;
    }
    
    try {
      // Show loading indicator
      setIsSubmitting(true);
      
      // Gather data for PDF
      const pdfData = {
        customerInfo,
        selectedPackage,
        selectedEquipment,
        totalPrice: calculateTotalPriceInternal(),
        discountedPrice,
        monthlyPayment: getMonthlyPaymentInternal(),
        financingOption,
        financingTerm,
        customRate,
        allEquipment // Add allEquipment for better equipment name lookup
      };
      
      console.log('Generating PDF with data:', pdfData);
      
      // Generate PDF - this returns a Uint8Array directly
      const pdfBytes = await fillPdfForm(pdfData);
      
      // Send to SignNow for processing with signing method
      console.log(`Sending PDF to SignNow via ${signingMethod}...`);
      try {
        const signNowResult = await processDocument(pdfBytes, customerInfo, signingMethod);
        console.log('SignNow result:', signNowResult);
        
        // Show success with SignNow URL or local file path
        setSubmitSuccess(true);
        
        // If you need to access the results in the SuccessModal, save them in state
        setResult(signNowResult);
        
      } catch (signNowError) {
        console.error('SignNow error:', signNowError);
        
        // If SignNow fails, at least we have the local PDF download
        downloadPdf(pdfBytes, customerInfo.lastName || 'customer');
        
        // Still show success modal but with a warning about SignNow
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    customerInfo, 
    selectedPackage, 
    selectedEquipment,
    discountedPrice,
    discountReason,
    discountManagerApproval,
    financingOption, 
    financingTerm, 
    customRate,
    allEquipment,
    calculateTotalPriceInternal,
    getMonthlyPaymentInternal,
    fillPdfForm,
    downloadPdf,
    processDocument,
    signingMethod,
    t
  ]);

  const resetForm = useCallback(() => {
    setSubmitSuccess(false);
    setStep(1);
    setSelectedEquipment([]);
    setSelectedPackage(null);
    setFinancingOption(null);
    setFinancingTerm(null);
    setCustomRate(null);
    setDiscountedPrice(null);
    setDiscountReason('');
    setDiscountManagerApproval(false);
    setCustomerInfo({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '' });
    setShowPresentationView(false);
    setShowTRecommendations(false);
    setSigningMethod('email');
  }, []);

  const togglePresentationView = () => {
    setShowPresentationView(!showPresentationView);
  };

  if (!catalog || typeof catalog !== 'object' || Object.keys(catalog).length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="bg-red-100 p-6 rounded-xl text-red-700 text-lg">
          <h3 className="font-bold text-xl mb-2">{t('errors.catalogLoadFailed')}</h3>
          <p>{t('errors.refreshPage')}</p>
        </div>
      </div>
    );
  }

  // Presentation View - For showing to customers
  if (showPresentationView) {
    const effectivePrice = getEffectivePrice();
    const originalPrice = calculateTotalPriceInternal();
    
    return (
      <div className="max-w-4xl mx-auto p-4 bg-blue-50 min-h-screen">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-blue-700">{t('app.title')}</h1>
          <button 
            onClick={togglePresentationView}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg text-lg"
          >
            {t('salesTool.presentationMode.editQuote')}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold text-center mb-4 text-blue-700">
            {t('salesTool.presentationMode.title')}
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Selected Equipment or Package */}
            <div className="bg-blue-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">
                {t('salesTool.presentationMode.selected')}
              </h3>
              
              {selectedPackage ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xl font-bold">{selectedPackage.name}</span>
                    <div className="text-right">
                      <div className="text-lg text-gray-500 line-through">
                        ${selectedPackage.individualPrice.toLocaleString()}
                      </div>
                      {/* Show discounted price if applicable */}
                      {discountedPrice !== null ? (
                        <>
                          <div className="text-lg text-gray-500 line-through">
                            ${selectedPackage.packagePrice.toLocaleString()}
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${discountedPrice.toLocaleString()}
                          </div>
                          <div className="text-lg text-green-600 font-medium">
                            {t('salesTool.priceEditor.specialDiscount')}
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          ${selectedPackage.packagePrice.toLocaleString()}
                        </div>
                      )}
                      <div className="text-lg text-green-600 font-medium">
                        {t('salesTool.equipment.save')} ${(selectedPackage.individualPrice - effectivePrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <p className="font-medium mb-2">{t('salesTool.presentationMode.includes')}</p>
                    <ul className="list-disc pl-6 space-y-2">
                      {selectedPackage.items.map((itemId, idx) => {
                        const item = allEquipment.find(e => e.id === itemId);
                        return (
                          <li key={idx} className="text-lg">
                            {item ? item.name : `Item #${itemId}`}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <ul className="space-y-3">
                    {selectedEquipment.map(item => (
                      <li key={item.id} className="flex justify-between p-3 bg-white rounded-lg">
                        <span className="text-lg">{item.name}</span>
                        <span className="font-bold">
                          ${(hasConditioner && hasFilter && item.packagePrice && item.category !== 'conditioner' 
                            ? item.packagePrice 
                            : item.price).toLocaleString()}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between p-3 bg-green-50 rounded-lg text-xl font-bold">
                      <span>{t('salesTool.review.total')}</span>
                      {discountedPrice !== null ? (
                        <div className="text-right">
                          <div className="text-lg text-gray-500 line-through">${originalPrice.toLocaleString()}</div>
                          <div className="text-xl text-green-600">${discountedPrice.toLocaleString()}</div>
                        </div>
                      ) : (
                        <span>${effectivePrice.toLocaleString()}</span>
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Financing Information */}
            {financingOption && (
              <div className="bg-green-50 p-5 rounded-xl">
                <h3 className="text-lg font-semibold mb-3 text-green-700">
                  {t('salesTool.review.financingDetails')}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-white p-4 rounded-lg mb-2">
                    <div className="text-center">
                      <div className="text-gray-600">{t('salesTool.financing.monthlyPayment')}</div>
                      <div className="text-3xl font-bold text-green-600">
                        ${getMonthlyPaymentInternal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600">{t('salesTool.financing.program')}</div>
                    <div className="font-semibold">{financingOption.name}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600">{t('salesTool.financing.term')}</div>
                    <div className="font-semibold">
                      {financingOption.id === 'fin2' 
                        ? t('salesTool.financing.revolving') 
                        : t('salesTool.financing.months', { term: financingTerm })}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600">{t('salesTool.review.interestRate')}</div>
                    <div className="font-semibold">
                      {customRate !== null ? customRate : financingOption.interestRate}%
                    </div>
                  </div>
                  
                  {financingOption.id !== 'fin2' && financingTerm && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-gray-600">{t('salesTool.financing.totalCost')}</div>
                      <div className="font-semibold">
                        ${(getMonthlyPaymentInternal() * parseInt(financingTerm || 0)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* System Benefits */}
            <div className="bg-yellow-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold mb-3 text-yellow-700">
                {t('salesTool.presentationMode.benefits')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="font-bold text-blue-600">{t('salesTool.presentationMode.benefitsList.clean')}</h4>
                  <p>{t('salesTool.presentationMode.benefitsList.cleanDesc')}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="font-bold text-blue-600">{t('salesTool.presentationMode.benefitsList.reduced')}</h4>
                  <p>{t('salesTool.presentationMode.benefitsList.reducedDesc')}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="font-bold text-blue-600">{t('salesTool.presentationMode.benefitsList.soft')}</h4>
                  <p>{t('salesTool.presentationMode.benefitsList.softDesc')}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="font-bold text-blue-600">{t('salesTool.presentationMode.benefitsList.professional')}</h4>
                  <p>{t('salesTool.presentationMode.benefitsList.professionalDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-between">
          <button 
            onClick={togglePresentationView}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg text-lg"
          >
            {t('salesTool.presentationMode.editQuote')}
          </button>
          
          <button 
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg"
          >
            {t('salesTool.presentationMode.completePurchase')}
          </button>
        </div>
      </div>
    );
  }

  // Standard edit mode
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-600">{t('app.title')}</h1>
        <h2 className="text-xl">{t('app.subtitle')}</h2>
        
        {/* Show presentation mode button only when we have enough data */}
        {step >= 3 && (
          <button 
            onClick={togglePresentationView}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md text-lg hover:bg-blue-700"
          >
            {t('salesTool.presentationMode.switchButton')}
          </button>
        )}
      </header>
      
      {/* Progress Tracker - Updated for iPad */}
      <div className="mb-8">
        {/* Progress steps - Made larger and more touch friendly */}
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div 
              key={stepNum}
              className={`text-center flex-1 ${step >= stepNum ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
              onClick={() => step > stepNum && setStep(stepNum)} // Allow going back
            >
              <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-full text-lg
                ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {stepNum}
              </div>
              <span className="text-base mt-2 block">
                {stepNum === 1 ? t('salesTool.steps.equipment') : 
                 stepNum === 2 ? t('salesTool.steps.financing') : 
                 stepNum === 3 ? t('salesTool.steps.customer') : t('salesTool.steps.review')}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-gray-50 p-6 rounded-xl">
        {/* Step 1: Equipment Selection */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('salesTool.equipment.title')}</h3>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New T Value Recommendations Button */}
              <button 
                onClick={() => setShowTRecommendations(true)} 
                className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-yellow-600"
              >
                Use T-Value Recommendations
              </button>

              <button 
                onClick={() => setShowPackageModal(true)} 
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-green-700"
              >
                {t('salesTool.equipment.viewPackages')}
              </button>
            </div>
            
            {/* T Recommendation Selector */}
            {showTRecommendations && (
              <div className="mb-6">
                <TRecommendationSelector 
                  packages={packages || []}
                  financingOptions={financingOptions || []}
                  onSelectRecommendation={handleTRecommendation}
                />
                <button 
                  onClick={() => setShowTRecommendations(false)}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel T Value Selection
                </button>
              </div>
            )}
            
            {showPackageModal && (
              <PackageSelector 
                isOpen={showPackageModal} 
                onClose={() => setShowPackageModal(false)} 
                packages={Array.isArray(packages) ? packages : []} 
                onSelectPackage={handleSelectPackage} 
                equipment={Array.isArray(allEquipment) ? allEquipment : []}
              /> 
            )}
            
            {selectedPackage && (
              <div className="mt-4 bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-xl">{selectedPackage.name}</h4>
                    <p className="text-lg text-gray-600">{t('salesTool.equipment.packageTitle')}</p>
                  </div>
                  <div className="text-right mt-3 md:mt-0">
                    <div className="text-lg text-gray-500 line-through">
                      ${selectedPackage.individualPrice.toLocaleString()}
                    </div>
                    <div className="font-bold text-2xl text-green-600">
                      ${selectedPackage.packagePrice.toLocaleString()}
                    </div>
                    <div className="text-lg text-green-600">
                      {t('salesTool.equipment.save')} ${(selectedPackage.individualPrice - selectedPackage.packagePrice).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-lg border-t pt-4 mt-4">
                  <p className="font-medium mb-2">{t('salesTool.equipment.includes')}</p>
                  <ul className="list-disc ml-6 space-y-2">
                    {selectedPackage.items.map((itemId, idx) => {
                      const item = allEquipment.find(e => e.id === itemId);
                      return (
                        <li key={idx}>{item ? item.name : `Item #${itemId}`}</li>
                      );
                    })}
                  </ul>
                </div>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="mt-4 w-full px-4 py-3 bg-red-600 text-white rounded-lg text-lg hover:bg-red-700"
                >
                  {t('salesTool.equipment.removePackage')}
                </button>
              </div>
            )}
            
            {selectedPackage && (
              <div className="mt-4 bg-blue-50 p-5 rounded-xl text-lg">
                <p>{t('salesTool.equipment.packageInfo')}</p>
              </div>
            )}
            
            {!selectedPackage && !showTRecommendations && (
              <EquipmentSelector 
                catalog={catalog || {}} 
                selectedEquipment={selectedEquipment || []} 
                setSelectedEquipment={setSelectedEquipment} 
              />
            )}
            
            {/* Fixed position next button for iPad */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-end">
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedPackage && selectedEquipment.length === 0} 
                className={`px-6 py-3 rounded-lg text-lg font-medium shadow-md
                  ${(selectedPackage || selectedEquipment.length > 0) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {t('salesTool.equipment.nextButton')}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Financing Options with Price Editing */}
        {step === 2 && (
          <div>
            <FinancingOptions 
              totalPrice={calculateTotalPriceInternal()}
              discountedPrice={discountedPrice}
              onPriceChange={handlePriceChange}
              financingOption={financingOption} 
              setFinancingOption={setFinancingOption} 
              financingTerm={financingTerm} 
              setFinancingTerm={setFinancingTerm} 
              customRate={customRate} 
              setCustomRate={setCustomRate} 
              financingOptionsData={financingOptions || []} 
              onBack={() => setStep(1)} 
              onNext={() => setStep(3)} 
              isPortrait={isPortrait} // Pass orientation for responsive display
            />
            
            {/* Display manager approval warning if needed */}
            {discountManagerApproval && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 mt-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      {t('salesTool.priceEditor.managerApprovalRequired')}
                    </h3>
                    <div className="mt-1 text-sm text-yellow-700">
                      <p>
                        {t('salesTool.priceEditor.managerApprovalMessage')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Fixed navigation for iPad */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-between">
              <button 
                onClick={() => setStep(1)} 
                className="px-6 py-3 bg-gray-500 text-white rounded-lg text-lg font-medium shadow-md hover:bg-gray-600"
              >
                {t('navigation.back')}
              </button>
              
              <button 
                onClick={() => setStep(3)} 
                disabled={!financingOption || (!financingTerm && financingOption.id !== 'fin2')} 
                className={`px-6 py-3 rounded-lg text-lg font-medium shadow-md
                  ${financingOption && (financingTerm || financingOption.id === 'fin2') 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {t('salesTool.financing.nextButton')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customer Form */}
        {step === 3 && (
          <CustomerForm 
            customerInfo={customerInfo} 
            setCustomerInfo={setCustomerInfo} 
            onBack={() => setStep(2)} 
            onNext={() => setStep(4)} 
            isPortrait={isPortrait}
          />
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('salesTool.review.title')}</h3>
            <div className="grid grid-cols-1 gap-6">
              {/* Customer Information Card */}
              <div className="bg-white p-5 rounded-xl shadow-md">
                <h4 className="text-lg font-medium mb-4 text-blue-700 border-b pb-2">{t('salesTool.review.customerInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                  <div>
                    <p className="mb-3">
                      <span className="font-medium inline-block w-24">{t('salesTool.review.name')}</span>
                      {customerInfo.firstName} {customerInfo.lastName}
                    </p>
                    <p className="mb-3">
                      <span className="font-medium inline-block w-24">{t('salesTool.review.email')}</span>
                      {customerInfo.email}
                    </p>
                    <p className="mb-3">
                      <span className="font-medium inline-block w-24">{t('salesTool.review.phone')}</span>
                      {customerInfo.phone}
                    </p>
                  </div>
                  <div>
                    <p className="mb-3">
                      <span className="font-medium">{t('salesTool.review.address')}</span>
                    </p>
                    <p className="pl-4 mb-1">{customerInfo.address}</p>
                    <p className="pl-4">{customerInfo.city}, {customerInfo.state} {customerInfo.zip}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-base"
                >
                  {t('salesTool.review.editCustomer')}
                </button>
              </div>
              
              {/* Signing Method Selector */}
              <SigningMethodSelector 
                signingMethod={signingMethod}
                setSigningMethod={setSigningMethod}
                customerInfo={customerInfo}
              />
              
              {/* Order Summary Card - without Price Editor now */}
              <OrderSummary 
                selectedPackage={selectedPackage}
                selectedEquipment={selectedEquipment}
                totalPrice={calculateTotalPriceInternal()}
                discountedPrice={discountedPrice}
                monthlyPayment={getMonthlyPaymentInternal()}
                financingOption={financingOption}
                financingTerm={financingTerm}
                customRate={customRate}
                hasConditioner={hasConditioner}
                hasFilter={hasFilter}
                allEquipment={allEquipment}
                allowPriceEdit={false} // Disable price editing in review step
              />
            </div>
            
            {/* Fixed Position Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-between">
              <button 
                onClick={() => setStep(3)} 
                className="px-6 py-3 bg-gray-500 text-white rounded-lg text-lg shadow-md hover:bg-gray-600"
              >
                {t('navigation.back')}
              </button>
              
              <button 
                onClick={handleSubmit} 
                className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium shadow-md hover:bg-green-700"
              >
                {t('salesTool.review.completeButton')}
              </button>
            </div>
          </div>
        )}
      </div>

 {/* Success Modal */}
{submitSuccess && (
  <SuccessModal 
    isVisible={submitSuccess} 
    customerEmail={customerInfo.email} 
    onClose={() => setSubmitSuccess(false)} 
    onStartNew={resetForm} 
    documentUrl={signNowResult?.documentUrl} 
    result={signNowResult} // Pass the entire result object
  />
)}

      {/* Loading overlay while processing PDF/SignNow */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processing your document...</p>
            <p className="text-sm text-gray-600 mt-2">Please don't close this window.</p>
          </div>
        </div>
      )}
    </div>
  );
}