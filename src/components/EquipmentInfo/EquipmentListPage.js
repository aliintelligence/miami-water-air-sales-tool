// src/components/EquipmentInfo/EquipmentListPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEquipmentCatalog } from '../../hooks/useEquipmentCatalog';

const EquipmentListPage = () => {
  const { catalog } = useEquipmentCatalog();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Updated function to get image path using filename if available
  const getEquipmentImagePath = (item) => {
    const fallbackImage = '/images/equipment/placeholder.jpg'; // Define a placeholder
    if (!item || !item.id) return fallbackImage; // Handle cases with invalid item

    const filename = item.imageFilename || `${item.id}.jpg`; // Use filename or fallback to ID.jpg
    // Basic check to prevent using empty filename
    if (!filename.trim()) {
        return fallbackImage;
    }
    return `/images/equipment/${filename}`;
  };
  
  // Format a category key for display
  const formatCategoryName = (key) => {
    switch(key) {
      case 'conditioners': return 'Water Conditioners';
      case 'filters': return 'Whole House Filters';
      case 'drinkingWater': return 'Drinking Water Systems';
      case 'upgrades': return 'System Upgrades';
      case 'nonRainsoft': return 'Non-RainSoft Products';
      case 'addons': return 'Special Add-ons';
      default: return key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Unknown';
    }
  };
  
  // Get all equipment items from all categories
  const getAllEquipment = () => {
    if (!catalog) return []; // Handle catalog not loaded yet
    const allItems = [];
    Object.keys(catalog).forEach(category => {
      if (Array.isArray(catalog[category])) {
        catalog[category].forEach(item => {
          if (item && item.id) { // Ensure item and item.id exist
             allItems.push({
               ...item,
               categoryKey: category,
               categoryName: formatCategoryName(category)
             });
          }
        });
      }
    });
    return allItems;
  };
  
  // Get equipment for the currently selected category
  const getFilteredEquipment = () => {
    if (activeCategory === 'all') {
      return getAllEquipment();
    }
    if (!catalog || !catalog[activeCategory] || !Array.isArray(catalog[activeCategory])) {
      return [];
    }
    return catalog[activeCategory]
        .filter(item => item && item.id) // Filter out invalid items
        .map(item => ({
            ...item,
            categoryKey: activeCategory,
            categoryName: formatCategoryName(activeCategory)
        }));
  };
  
  const filteredEquipment = getFilteredEquipment();
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Equipment Information</h1>
      
      {/* Category Filters */}
      <div className="flex flex-wrap justify-center mb-8 gap-2">
        <button className={`px-4 py-2 rounded-full ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} onClick={() => setActiveCategory('all')}>All Equipment</button>
        {catalog && Object.keys(catalog).map(category => (
          Array.isArray(catalog[category]) && catalog[category].length > 0 ? (
            <button key={category} className={`px-4 py-2 rounded-full ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} onClick={() => setActiveCategory(category)}>
              {formatCategoryName(category)}
            </button>
          ) : null
        ))}
      </div>
      
      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map(item => (
          <Link key={item.id} to={`/equipment/${item.id}`} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center p-4">
              {/* Use updated image path function */}
              <img 
                src={getEquipmentImagePath(item)} 
                alt={item.name || 'Equipment Image'} 
                // Removed fixed width/height, use classes for control
                className="h-36 w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.onerror = null; e.target.src = '/images/equipment/placeholder.jpg'; }}
              />
            </div>
            <div className="p-4">
              <div className="text-xs text-blue-600 font-medium">{item.categoryName}</div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
              <div className="mt-2 flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-900">${(item.price || 0).toLocaleString()}</span>
                  {item.packagePrice && ( <span className="ml-2 text-sm text-green-600">${item.packagePrice.toLocaleString()} (package)</span> )}
                </div>
                <div className="text-blue-600 text-sm font-medium group-hover:underline">View Details</div>
              </div>
              {item.subscriptionInfo && ( <div className="mt-2 text-sm text-blue-600">{item.subscriptionInfo}</div> )}
            </div>
          </Link>
        ))}
      </div>
      
      {filteredEquipment.length === 0 && ( <div className="text-center py-12 bg-gray-50 rounded-lg">{/* No equipment message */}</div> )}
    </div>
  );
};

export default EquipmentListPage;