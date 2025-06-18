// src/components/SalesTool/OrderSummary.js
import React from 'react';
import { useTranslation } from '../../utils/i18n';

const OrderSummary = ({ 
  selectedPackage, 
  selectedEquipment = [],
  totalPrice, 
  discountedPrice,
  monthlyPayment, 
  financingOption, 
  financingTerm,
  customRate,
  hasConditioner,
  hasFilter,
  allEquipment = []
}) => {
  const { t } = useTranslation();

  // Calculate total savings if using a package
  const calculateSavings = () => {
    if (selectedPackage) {
      const originalPrice = selectedPackage.individualPrice || 0;
      const effectivePrice = discountedPrice !== null ? discountedPrice : (selectedPackage.packagePrice || 0);
      return originalPrice - effectivePrice;
    }
    return 0;
  };

  // Calculate total financing cost
  const calculateTotalFinancingCost = () => {
    if (!financingTerm || !monthlyPayment) return 0;
    const term = parseInt(financingTerm);
    if (isNaN(term) || term <= 0) return 0;
    return term * monthlyPayment;
  };

  // Helper to find item name by ID when displaying package contents
  const getItemNameById = (itemId) => {
    if (!allEquipment || !Array.isArray(allEquipment)) return `Item #${itemId}`;
    const item = allEquipment.find(e => e && e.id === itemId);
    return item ? item.name : `Item #${itemId}`;
  };

  // Calculate what price to display
  const effectivePrice = discountedPrice !== null ? discountedPrice : totalPrice;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">{t('salesTool.review.orderSummary')}</h3>
      
      {/* Equipment Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 uppercase">{t('salesTool.review.selectedEquipment')}</h4>
        {selectedPackage ? (
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{selectedPackage.name}</span>
              <div className="text-right">
                <div className="text-sm text-gray-500 line-through">
                  ${selectedPackage.individualPrice?.toLocaleString() || '0'}
                </div>
                <div className="font-bold text-green-600">
                  ${(discountedPrice !== null ? discountedPrice : selectedPackage.packagePrice)?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            {calculateSavings() > 0 && (
              <div className="text-sm text-green-600 mt-1">
                {t('salesTool.equipment.save')}: ${calculateSavings()?.toLocaleString() || '0'}
              </div>
            )}
            {selectedPackage.items && selectedPackage.items.length > 0 && (
              <div className="mt-2 text-sm">
                <p className="font-medium">{t('salesTool.equipment.includes')}</p>
                <ul className="list-disc ml-5 mt-1">
                  {selectedPackage.items.map((itemId, idx) => (
                    <li key={idx}>{getItemNameById(itemId)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <ul className="mt-2 divide-y">
            {Array.isArray(selectedEquipment) && selectedEquipment.map(item => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium">
                  {hasConditioner && hasFilter && item.packagePrice && item.category !== 'conditioner' 
                    ? `$${item.packagePrice?.toLocaleString() || '0'}` 
                    : `$${item.price?.toLocaleString() || '0'}`
                  }
                </span>
              </li>
            ))}
            {(!Array.isArray(selectedEquipment) || selectedEquipment.length === 0) && (
              <li className="py-2 text-gray-500 italic">No equipment selected</li>
            )}
          </ul>
        )}
      </div>
      
      {/* Financing Details */}
      {financingOption && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 uppercase">{t('salesTool.review.financingDetails')}</h4>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span>{t('salesTool.review.provider')}</span>
              <span>{financingOption.name}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('salesTool.review.interestRate')}</span>
              <span>{customRate !== null ? customRate : financingOption.interestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>{t('salesTool.review.term')}</span>
              <span>
                {financingOption.id === 'fin2' 
                  ? t('salesTool.financing.revolving') 
                  : t('salesTool.financing.months', { term: financingTerm })}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t('salesTool.review.monthlyPayment')}</span>
              <span>${monthlyPayment.toFixed(2)}</span>
            </div>
            {financingTerm && financingTerm !== "0" && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('salesTool.review.totalCost')}</span>
                <span>${calculateTotalFinancingCost().toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Installation Notice */}
      <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
        <p>{t('salesTool.review.includedItems')}</p>
        <ul className="list-disc ml-5 mt-2">
          <li>{t('salesTool.review.installationItems.installation')}</li>
          <li>{t('salesTool.review.installationItems.taxes')}</li>
          <li>{t('salesTool.review.installationItems.warranty')}</li>
          <li>{t('salesTool.review.installationItems.support')}</li>
        </ul>
      </div>
      
      {/* Total Price - Simple display for review step */}
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{t('salesTool.review.total')}</span>
          <div className="text-right">
            {discountedPrice !== null ? (
              <>
                <div className="text-sm text-gray-500 line-through">
                  ${totalPrice?.toLocaleString() || '0'}
                </div>
                <div className="text-xl font-bold text-green-600">
                  ${discountedPrice?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-green-600">
                  {t('salesTool.priceEditor.specialDiscount')}
                </div>
              </>
            ) : (
              <span className="text-xl font-bold">${totalPrice?.toLocaleString() || '0'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;