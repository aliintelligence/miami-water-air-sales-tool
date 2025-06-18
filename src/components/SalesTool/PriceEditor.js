// src/components/SalesTool/PriceEditor.js
import React, { useState } from 'react';
import { useTranslation } from '../../utils/i18n';

const PriceEditor = ({ 
  originalPrice, 
  discountedPrice, 
  onPriceChange,
  onCancel
}) => {
  const { t } = useTranslation();
  const [editedPrice, setEditedPrice] = useState(discountedPrice !== null ? discountedPrice : originalPrice);
  const [discountReason, setDiscountReason] = useState('');
  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
  const [discountValue, setDiscountValue] = useState('');

  // Handle direct price edit
  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value);
    setEditedPrice(isNaN(newPrice) || newPrice < 0 ? 0 : newPrice);
  };

  // Apply discount by amount or percentage
  const applyDiscount = () => {
    if (!discountValue || parseFloat(discountValue) <= 0) return;
    
    let newPrice;
    if (discountType === 'percentage') {
      const percentage = parseFloat(discountValue) || 0;
      newPrice = originalPrice * (1 - percentage / 100);
    } else {
      const amount = parseFloat(discountValue) || 0;
      newPrice = originalPrice - amount;
    }
    // Ensure price doesn't go below zero
    newPrice = Math.max(newPrice, 0);
    setEditedPrice(newPrice);
  };

  // Save edited price
  const savePrice = () => {
    if (editedPrice === originalPrice) {
      // If price is same as original, treat as cancelling discount
      onPriceChange(originalPrice, '');
      return;
    }
    
    if (!discountReason && editedPrice < originalPrice) {
      // Require a reason for discounts
      alert(t('salesTool.priceEditor.selectReason'));
      return;
    }
    
    onPriceChange(editedPrice, discountReason);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedPrice(discountedPrice !== null ? discountedPrice : originalPrice);
    setDiscountReason('');
    setDiscountValue('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-lg mb-3">{t('salesTool.priceEditor.editPrice')}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('salesTool.priceEditor.originalPrice')}</label>
          <div className="text-lg font-medium">${originalPrice.toLocaleString()}</div>
        </div>
        
        <div>
          <label htmlFor="editedPrice" className="block text-sm font-medium mb-1">
            {t('salesTool.priceEditor.newPrice')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="editedPrice"
              value={editedPrice}
              onChange={handlePriceChange}
              min="0"
              step="1"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-2">
          <div className="flex-1">
            <label htmlFor="discountValue" className="block text-sm font-medium mb-1">
              {t('salesTool.priceEditor.applyDiscount')}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="discountValue"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                min="0"
                step={discountType === 'percentage' ? "0.1" : "1"}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <select
                  id="discount-type"
                  name="discount-type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-r-md"
                >
                  <option value="amount">$</option>
                  <option value="percentage">%</option>
                </select>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={applyDiscount}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('salesTool.priceEditor.apply')}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="discountReason" className="block text-sm font-medium mb-1">
          {t('salesTool.priceEditor.discountReason')}
        </label>
        <select
          id="discountReason"
          value={discountReason}
          onChange={(e) => setDiscountReason(e.target.value)}
          className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
        >
          <option value="">{t('salesTool.priceEditor.selectReason')}</option>
          <option value="manager-approval">{t('salesTool.priceEditor.reasons.managerApproval')}</option>
          <option value="seasonal-promotion">{t('salesTool.priceEditor.reasons.seasonalPromotion')}</option>
          <option value="competitive-match">{t('salesTool.priceEditor.reasons.competitiveMatch')}</option>
          <option value="loyalty-discount">{t('salesTool.priceEditor.reasons.loyaltyDiscount')}</option>
          <option value="volume-discount">{t('salesTool.priceEditor.reasons.volumeDiscount')}</option>
          <option value="other">{t('salesTool.priceEditor.reasons.other')}</option>
        </select>
      </div>
      
      {editedPrice !== originalPrice && (
        <div className="mb-4 bg-yellow-50 p-2 rounded text-sm">
          <p className="font-medium text-yellow-800">{t('salesTool.priceEditor.summary')}</p>
          <p>{t('salesTool.priceEditor.originalPrice')}: ${originalPrice.toLocaleString()}</p>
          <p>{t('salesTool.priceEditor.newPrice')}: ${editedPrice.toLocaleString()}</p>
          <p>
            {t('salesTool.priceEditor.discountApplied')}: ${(originalPrice - editedPrice).toLocaleString()} 
            ({Math.round(((originalPrice - editedPrice) / originalPrice) * 100)}%)
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button 
          type="button" 
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('navigation.cancel')}
        </button>
        <button 
          type="button" 
          onClick={savePrice}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {t('navigation.save')}
        </button>
      </div>
    </div>
  );
};

export default PriceEditor;