// src/hooks/useCategoryManager.js
import { useState, useEffect } from 'react';

export const useCategoryManager = (catalog) => {
  const [categories, setCategories] = useState({
    conditioners: {
      label: 'Water Conditioners',
      fields: ['name', 'price', 'type', 'category'],
      typeOptions: ['EC5', 'TCM', 'Oxytech'],
      defaultType: 'EC5',
      categoryValue: 'conditioner'
    },
    filters: {
      label: 'Whole House Filters',
      fields: ['name', 'price', 'packagePrice', 'category'],
      categoryValue: 'filter'
    },
    drinkingWater: {
      label: 'Drinking Water Systems',
      fields: ['name', 'price', 'packagePrice', 'category'],
      categoryValue: 'drinking'
    },
    upgrades: {
      label: 'System Upgrades',
      fields: ['name', 'price', 'category'],
      categoryValue: 'upgrade'
    },
    nonRainsoft: {
      label: 'Non-RainSoft Products',
      fields: ['name', 'price', 'packagePrice', 'category'],
      categoryValue: 'nonRainsoft'
    }
  });

  // Get all equipment items in a flat array
  const getAllEquipment = () => {
    return Object.keys(catalog).flatMap(key => 
      catalog[key].map(item => ({ ...item, category: key }))
    );
  };

  // Validate an equipment item based on its category
  const validateItem = (item, categoryKey) => {
    const category = categories[categoryKey];
    const errors = [];
    
    if (!item.name || item.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (typeof item.price !== 'number' || item.price < 0) {
      errors.push('Price must be a positive number');
    }
    
    // Check for required type field in conditioners
    if (categoryKey === 'conditioners' && !item.type) {
      errors.push('Conditioner type is required');
    }
    
    // If category has packagePrice field, validate it if present
    if (category.fields.includes('packagePrice') && 
        item.packagePrice !== undefined && 
        (typeof item.packagePrice !== 'number' || item.packagePrice < 0)) {
      errors.push('Package price must be a positive number');
    }
    
    return errors;
  };

  // Create a new item template for a category
  const createItemTemplate = (categoryKey) => {
    const category = categories[categoryKey];
    const template = {
      id: `${categoryKey.charAt(0)}${Date.now()}`,
      name: '',
      price: 0,
      category: category.categoryValue
    };
    
    // Add type for conditioners
    if (categoryKey === 'conditioners') {
      template.type = category.defaultType;
    }
    
    // Add packagePrice for applicable categories
    if (category.fields.includes('packagePrice')) {
      template.packagePrice = 0;
    }
    
    return template;
  };

  // Calculate package discounts and savings
  const calculatePackageSavings = (packageItem) => {
    const allItems = getAllEquipment();
    const individualTotal = packageItem.items.reduce((sum, itemId) => {
      const item = allItems.find(i => i.id === itemId);
      return sum + (item ? item.price : 0);
    }, 0);
    
    const packagePrice = packageItem.packagePrice || 0;
    const savings = individualTotal - packagePrice;
    const discountPercentage = individualTotal > 0 
      ? Math.round((savings / individualTotal) * 100) 
      : 0;
    
    return {
      individualTotal,
      savings,
      discountPercentage
    };
  };

  return {
    categories,
    getAllEquipment,
    validateItem,
    createItemTemplate,
    calculatePackageSavings
  };
};