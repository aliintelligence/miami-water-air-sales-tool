// src/components/SalesTool/EquipmentSelector.js - Optimized for iPad
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from '../../utils/i18n';

export default function EquipmentSelector({ catalog, selectedEquipment, setSelectedEquipment }) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [infoItem, setInfoItem] = useState(null);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const searchInputRef = useRef(null);
  const categoryScrollRef = useRef(null);
  
  // Handle orientation changes
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
  
  // Check if we have a conditioner selected
  const hasConditioner = useMemo(() => 
    selectedEquipment.some(item => 
      item.category === 'conditioner' && 
      (item.type === 'EC5' || item.type === 'TCM' || item.type === 'Oxytech')
    ), 
    [selectedEquipment]
  );
  
  // Check if we have a filter selected
  const hasFilter = useMemo(() => 
    selectedEquipment.some(item => item.category === 'filter'), 
    [selectedEquipment]
  );
  
  // Calculate the subtotal with potential package discounts
  const subtotal = useMemo(() => {
    if (hasConditioner && hasFilter) {
      return selectedEquipment.reduce((sum, item) => {
        if (item.packagePrice && item.category !== 'conditioner') {
          return sum + item.packagePrice;
        } else {
          return sum + item.price;
        }
      }, 0);
    } else {
      return selectedEquipment.reduce((sum, item) => sum + (item.price || 0), 0);
    }
  }, [selectedEquipment, hasConditioner, hasFilter]);
  
  // Get all product categories from the catalog
  const categoryOptions = useMemo(() => {
    let options = [
      { id: 'all', label: t('equipmentInfo.allEquipment') }
    ];
    
    if (catalog) {
      if (catalog.conditioners?.length > 0) {
        options.push({ id: 'conditioners', label: t('equipmentCategories.conditioners') });
      }
      if (catalog.filters?.length > 0) {
        options.push({ id: 'filters', label: t('equipmentCategories.filters') });
      }
      if (catalog.drinkingWater?.length > 0) {
        options.push({ id: 'drinkingWater', label: t('equipmentCategories.drinkingWater') });
      }
      if (catalog.upgrades?.length > 0) {
        options.push({ id: 'upgrades', label: t('equipmentCategories.upgrades') });
      }
      if (catalog.nonRainsoft?.length > 0) {
        options.push({ id: 'nonRainsoft', label: t('equipmentCategories.nonRainsoft') });
      }
      if (catalog.addons?.length > 0) {
        options.push({ id: 'addons', label: t('equipmentCategories.addons') });
      }
    }
    
    return options;
  }, [catalog, t]);
  
  // Get all equipment, filtered by category and search term if applicable
  const filteredEquipment = useMemo(() => {
    if (!catalog) return [];
    
    let items = [];
    
    // Filter by category
    if (activeCategory === 'all') {
      Object.keys(catalog).forEach(category => {
        if (Array.isArray(catalog[category])) {
          catalog[category].forEach(item => {
            if (item) items.push({ ...item, categoryKey: category });
          });
        }
      });
    } else if (catalog[activeCategory] && Array.isArray(catalog[activeCategory])) {
      items = catalog[activeCategory].map(item => ({ ...item, categoryKey: activeCategory }));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(term) || 
        item.category?.toLowerCase().includes(term) ||
        item.type?.toLowerCase().includes(term)
      );
    }
    
    return items;
  }, [catalog, activeCategory, searchTerm]);
  
  // Check if an item is already in the selection
  const isItemSelected = (itemId) => {
    return selectedEquipment.some(item => item.id === itemId);
  };
  
  // Add equipment to selection
  const addEquipment = (item) => {
    if (!isItemSelected(item.id)) {
      setSelectedEquipment([...selectedEquipment, item]);
      
      // Show animation or feedback for iPad UX
      const element = document.getElementById(`equipment-item-${item.id}`);
      if (element) {
        element.classList.add('pulse-animation');
        setTimeout(() => {
          element.classList.remove('pulse-animation');
        }, 500);
      }
      
      // Provide haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };
  
  // Remove equipment from selection
  const removeEquipment = (itemId) => {
    setSelectedEquipment(selectedEquipment.filter(item => item.id !== itemId));
    
    // Provide haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 30, 20]);
    }
  };
  
  // Focus search input
  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Show detailed info for an item
  const showItemInfo = (item) => {
    setInfoItem(item);
    setShowInfo(true);
  };
  
  // Format price with package discount for display
  const getDisplayPrice = (item) => {
    if (hasConditioner && hasFilter && item.packagePrice && item.category !== 'conditioner') {
      return (
        <div className="flex flex-col items-end">
          <span className="text-sm line-through text-gray-500">${item.price.toLocaleString()}</span>
          <span className="text-green-600 font-bold">${item.packagePrice.toLocaleString()}</span>
        </div>
      );
    }
    return <span className="font-bold">${item.price.toLocaleString()}</span>;
  };
  
  // Get the image path for an item
  const getImagePath = (item) => {
    if (!item || !item.id) return '/images/equipment/placeholder.jpg';
    const filename = item.imageFilename || `${item.id}.jpg`;
    return `/images/equipment/${filename}`;
  };
  
  // Reset search and filters
  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
  };
  
  return (
    <div className="equipment-selector">
      {/* Header: Category Filter + Search */}
      <div className="mb-6 bg-white p-4 rounded-2xl shadow-md sticky top-0 z-10 safe-top">
        {/* Search Input */}
        <div className="relative mb-4">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment..."
            className="w-full py-3 pl-10 pr-10 border border-gray-300 rounded-full text-lg shadow-sm"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 rounded-full hover:bg-gray-100 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Category Filter Pills */}
        <div ref={categoryScrollRef} className="flex overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-2">
            {categoryOptions.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap px-4 py-3 rounded-full text-base font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Equipment Grid */}
      <div className={`grid grid-cols-1 ${!isPortrait ? 'md:grid-cols-2' : ''} gap-4 mb-24`}>
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map(item => (
            <div 
              key={item.id}
              id={`equipment-item-${item.id}`} 
              className={`bg-white p-4 rounded-xl shadow-md transition-all ${isItemSelected(item.id) ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200'}`}
            >
              <div className="flex items-center w-full">
                {/* Item Image Thumbnail */}
                <div className="flex-shrink-0 mr-4">
                  <img 
                    src={getImagePath(item)}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded bg-gray-50"
                    onError={(e) => { e.target.src = '/images/equipment/placeholder.jpg'; }}
                  />
                </div>
                
                {/* Item Info */}
                <div className="flex-grow">
                  <div className="text-xs text-blue-600 font-medium">
                    {t(`equipmentCategories.${item.categoryKey}`, item.categoryKey)}
                  </div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.subscriptionInfo && (
                    <div className="text-sm text-blue-600 mt-1">{item.subscriptionInfo}</div>
                  )}
                </div>
                
                {/* Price and Action Buttons */}
                <div className="flex flex-col items-end ml-2 min-w-[80px]">
                  <div className="text-right mb-2">
                    {getDisplayPrice(item)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => showItemInfo(item)}
                      className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200" 
                      aria-label="View details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    {!isItemSelected(item.id) ? (
                      <button
                        onClick={() => addEquipment(item)}
                        className="p-2 bg-blue-600 rounded-full text-white shadow-sm hover:bg-blue-700"
                        aria-label="Add item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => removeEquipment(item.id)}
                        className="p-2 bg-red-600 rounded-full text-white shadow-sm hover:bg-red-700"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center col-span-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">Try selecting a different category or clearing your search.</p>
            <button 
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
      
      {/* Selected Equipment Summary - Fixed at Bottom on iPad */}
      {selectedEquipment.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-20 safe-bottom">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{selectedEquipment.length} items selected</span>
              <div className="text-xl font-bold">${subtotal.toLocaleString()}</div>
            </div>
            
            <button
              onClick={() => setSelectedEquipment([])}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg mr-2"
            >
              Clear All
            </button>
            
            <button 
              onClick={() => document.querySelector('.selected-items-drawer').classList.toggle('drawer-open')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
            >
              <span>View Selection</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Selected Items Drawer */}
          <div className="selected-items-drawer bg-white rounded-t-xl overflow-hidden transition-all duration-300 max-h-0">
            <div className="p-4">
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {selectedEquipment.map(item => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center">
                      <img 
                        src={getImagePath(item)}
                        alt={item.name}
                        className="w-10 h-10 object-contain rounded bg-white mr-3"
                        onError={(e) => { e.target.src = '/images/equipment/placeholder.jpg'; }}
                      />
                      <div className="truncate max-w-[150px]">
                        <div className="font-medium truncate">{item.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {hasConditioner && hasFilter && item.packagePrice && item.category !== 'conditioner' ? (
                          <div>
                            <span className="text-xs line-through text-gray-400">${item.price.toLocaleString()}</span>
                            <span className="block text-green-600">${item.packagePrice.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span>${item.price.toLocaleString()}</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => removeEquipment(item.id)}
                        className="p-2 text-red-500 rounded-lg hover:bg-red-50"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasConditioner && hasFilter && (
                <div className="mt-3 bg-green-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-green-100 rounded-full text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-green-700">{t('bundleDiscount.applied')}</p>
                      <p className="text-sm text-green-600">{t('bundleDiscount.description')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Item Detail Modal */}
      {showInfo && infoItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="relative">
              <img 
                src={getImagePath(infoItem)}
                alt={infoItem.name}
                className="w-full h-48 object-contain bg-gray-50 p-4"
                onError={(e) => { e.target.src = '/images/equipment/placeholder.jpg'; }}
              />
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <div className="text-sm text-blue-600 font-medium">
                {t(`equipmentCategories.${infoItem.categoryKey}`, infoItem.categoryKey)}
              </div>
              <h3 className="text-xl font-bold mb-2">{infoItem.name}</h3>
              
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <div className="text-sm text-gray-500">{t('equipmentInfo.price')}</div>
                  <div className="text-xl font-bold">${infoItem.price.toLocaleString()}</div>
                </div>
                {infoItem.packagePrice && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{t('equipmentInfo.packagePrice')}</div>
                    <div className="text-xl font-bold text-green-600">${infoItem.packagePrice.toLocaleString()}</div>
                  </div>
                )}
              </div>
              
              {infoItem.type && (
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {infoItem.type}
                  </span>
                </div>
              )}
              
              <p className="text-gray-600 mb-4">
                {infoItem.description || t('equipmentInfo.defaultDescription')}
              </p>
              
              {infoItem.subscriptionInfo && (
                <div className="bg-blue-50 p-3 rounded-xl mb-4">
                  <div className="text-sm font-medium text-blue-800">{t('equipmentInfo.subscription')}</div>
                  <div className="text-blue-600">{infoItem.subscriptionInfo}</div>
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowInfo(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium"
                >
                  {t('navigation.close')}
                </button>
                
                {!isItemSelected(infoItem.id) ? (
                  <button
                    onClick={() => {
                      addEquipment(infoItem);
                      setShowInfo(false);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium"
                  >
                    {t('navigation.add')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      removeEquipment(infoItem.id);
                      setShowInfo(false);
                    }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium"
                  >
                    {t('navigation.delete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add custom styles for animations */}
      <style jsx="true">{`
        .pulse-animation {
          animation: pulse 0.5s ease-in-out;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); background-color: rgba(219, 234, 254, 0.5); }
          100% { transform: scale(1); }
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .selected-items-drawer {
          transform-origin: bottom;
        }
        
        .drawer-open {
          max-height: 300px;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}