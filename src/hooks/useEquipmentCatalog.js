// src/hooks/useEquipmentCatalog.js
import { useState, useCallback, useEffect } from 'react';
import {
    defaultCatalog,
    defaultPackages,
    financingOptions as defaultFinancingOptions
} from '../utils/catalogDefaults';

// Helper to safely parse JSON from localStorage
const loadFromLocalStorage = (key, defaultValue) => {
    try {
        const storedValue = localStorage.getItem(key);
        const defaultVal = defaultValue === undefined ? (key === 'catalog' ? {} : []) : defaultValue; // Catalog default is object
        if (storedValue === null || storedValue === '') {
            return defaultVal;
        }
        const parsed = JSON.parse(storedValue);
        // Basic type checks
        if (key === 'catalog' && (typeof parsed !== 'object' || parsed === null)) return defaultVal;
        if (key !== 'catalog' && !Array.isArray(parsed)) return defaultVal;
        return parsed;
    } catch (error) {
        console.error(`Error reading or parsing ${key} from localStorage`, error);
        return defaultValue === undefined ? (key === 'catalog' ? {} : []) : defaultValue;
    }
};

// Helper to safely save JSON to localStorage
const saveToLocalStorage = (key, value) => {
     try {
         localStorage.setItem(key, JSON.stringify(value ?? (key === 'catalog' ? {} : []))); // Default based on key
     } catch (error) {
         console.error(`Error writing ${key} to localStorage`, error);
     }
};

export function useEquipmentCatalog() {
    // State Initialization using defaults
    const [catalog, setCatalog] = useState(() => loadFromLocalStorage('catalog', defaultCatalog));
    const [packages, setPackages] = useState(() => loadFromLocalStorage('packages', defaultPackages));
    const [financingOptions, setFinancingOptions] = useState(() =>
        loadFromLocalStorage('financingOptions', defaultFinancingOptions)
    );
    
    // Initialize data if empty on first load
    useEffect(() => {
        if (!catalog || typeof catalog !== 'object' || Object.keys(catalog).length === 0) {
            setCatalog(defaultCatalog);
            saveToLocalStorage('catalog', defaultCatalog);
        }
        
        if (!packages || !Array.isArray(packages) || packages.length === 0) {
            setPackages(defaultPackages);
            saveToLocalStorage('packages', defaultPackages);
        }
        
        if (!financingOptions || !Array.isArray(financingOptions) || financingOptions.length === 0) {
            setFinancingOptions(defaultFinancingOptions);
            saveToLocalStorage('financingOptions', defaultFinancingOptions);
        }
    }, [catalog, packages, financingOptions]);

    // --- Catalog (Equipment Item) Management Functions ---
    const addCatalogItem = useCallback((categoryKey, newItem) => {
        setCatalog(currentCatalog => {
            if (!currentCatalog || !Array.isArray(currentCatalog[categoryKey])) {
                 console.error(`Cannot add item, category ${categoryKey} not found or not an array in catalog.`);
                 // Initialize category if missing
                 const safeCatalog = currentCatalog || {};
                 const safeCategory = Array.isArray(safeCatalog[categoryKey]) ? safeCatalog[categoryKey] : [];
                 const newState = {
                    ...safeCatalog,
                    [categoryKey]: [...safeCategory, newItem]
                 };
                 saveToLocalStorage('catalog', newState);
                 console.log(`[useEquipmentCatalog] Added item to NEW category ${categoryKey}:`, newItem);
                 return newState;
            }
            // Category exists
            const newState = {
                ...currentCatalog,
                [categoryKey]: [...currentCatalog[categoryKey], newItem]
            };
            saveToLocalStorage('catalog', newState);
            console.log(`[useEquipmentCatalog] Added item to ${categoryKey}:`, newItem);
            return newState;
        });
    }, []);

    const updateCatalogItem = useCallback((categoryKey, index, field, value) => {
         setCatalog(currentCatalog => {
             if (!currentCatalog || !Array.isArray(currentCatalog[categoryKey]) || index < 0 || index >= currentCatalog[categoryKey].length) {
                 console.error(`Cannot update item, category ${categoryKey} or index ${index} invalid.`);
                 return currentCatalog;
             }
             const newState = {
                 ...currentCatalog,
                 [categoryKey]: currentCatalog[categoryKey].map((item, i) =>
                     i === index ? { ...item, [field]: value } : item
                 )
             };
             saveToLocalStorage('catalog', newState);
             return newState;
         });
    }, []);

    const deleteCatalogItemById = useCallback((categoryKey, itemId) => {
        setCatalog(currentCatalog => {
             if (!currentCatalog || !Array.isArray(currentCatalog[categoryKey])) {
                 console.error(`Cannot delete item, category ${categoryKey} not found or not an array.`);
                 return currentCatalog;
             }
             // Confirmation should happen in the component calling this
             const newState = {
                 ...currentCatalog,
                 [categoryKey]: currentCatalog[categoryKey].filter(item => item.id !== itemId)
             };
             saveToLocalStorage('catalog', newState);
             console.log(`[useEquipmentCatalog] Deleted item with ID ${itemId} from ${categoryKey}`);
             return newState;
        });
    }, []);

    // --- Package Management Functions ---
    const addPackage = useCallback((newPkgData = {}) => {
        setPackages(current => {
            const defaultPkg = {
                id: `pkg${Date.now()}`,
                name: 'New Package - Edit Me',
                items: [],
                individualPrice: 0,
                packagePrice: 0,
                ...newPkgData
            };
             const newState = [...(current || []), defaultPkg];
             saveToLocalStorage('packages', newState);
             return newState;
         });
    }, []);

    const removePackage = useCallback((indexToRemove) => {
        setPackages(current => {
            if (!Array.isArray(current)) return [];
            // Consider confirmation dialog here or in component
            const newState = current.filter((_, i) => i !== indexToRemove);
            saveToLocalStorage('packages', newState);
            return newState;
        });
    }, []);

     const updatePackage = useCallback((index, updates) => {
        setPackages(current => {
             if (!Array.isArray(current)) return [];
             const newState = current.map((pkg, i) => i === index ? { ...pkg, ...updates } : pkg);
             saveToLocalStorage('packages', newState);
             return newState;
        });
    }, []);

    // --- Financing Option Management Functions ---
    const addFinancingOption = useCallback((newOption = {}) => {
        setFinancingOptions(current => {
            const defaultOption = { 
                id: `fin_${Date.now()}`, 
                name: 'New Plan - Edit Me', 
                description: '', 
                interestRate: null, 
                terms: [], 
                paymentFactor: null, 
                logoUrl: '', 
                disclaimer: '', 
                ...newOption 
            };
            const newState = [...(current || []), defaultOption];
            saveToLocalStorage('financingOptions', newState);
            return newState;
        });
    }, []);

    const removeFinancingOption = useCallback((indexToRemove) => {
        setFinancingOptions(current => {
             if (!Array.isArray(current)) return [];
             const optionToRemove = current[indexToRemove];
             if (!window.confirm(`Are you sure you want to remove plan "${optionToRemove?.name || 'this plan'}"?`)) { 
                 return current; 
             }
            const newState = current.filter((_, i) => i !== indexToRemove);
            saveToLocalStorage('financingOptions', newState);
            return newState;
        });
    }, []);

    const updateFinancingOption = useCallback((index, updates) => {
        setFinancingOptions(current => {
             if (!Array.isArray(current)) return [];
            const newState = current.map((opt, i) => {
                if (i === index) {
                    const updatedOpt = { ...opt, ...updates };
                    // Type coercion/parsing for numeric fields
                    if (updates.hasOwnProperty('interestRate')) {
                        updatedOpt.interestRate = updates.interestRate === '' || updates.interestRate === null 
                            ? null 
                            : parseFloat(updates.interestRate);
                    }
                    
                    if (updates.hasOwnProperty('paymentFactor')) {
                        updatedOpt.paymentFactor = updates.paymentFactor === '' || updates.paymentFactor === null 
                            ? null 
                            : parseFloat(updates.paymentFactor);
                    }
                    
                    if (updates.hasOwnProperty('terms') && typeof updates.terms === 'string') {
                        updatedOpt.terms = updates.terms.split(',')
                            .map(term => {
                                const parsed = parseInt(term.trim(), 10);
                                return isNaN(parsed) ? null : parsed;
                            })
                            .filter(term => term !== null);
                    } else if (updates.hasOwnProperty('terms') && !Array.isArray(updates.terms)) { 
                        updatedOpt.terms = []; 
                    }
                    
                    return updatedOpt;
                }
                return opt;
            });
            saveToLocalStorage('financingOptions', newState);
            return newState;
        });
    }, []);

    // Reset all data to defaults
    const resetAllData = useCallback(() => {
        setCatalog(defaultCatalog);
        setPackages(defaultPackages);
        setFinancingOptions(defaultFinancingOptions);
        
        saveToLocalStorage('catalog', defaultCatalog);
        saveToLocalStorage('packages', defaultPackages);
        saveToLocalStorage('financingOptions', defaultFinancingOptions);
    }, []);

    // Return all state and functions needed
    return {
        catalog, packages, financingOptions,
        addPackage, updatePackage, removePackage,
        addFinancingOption, updateFinancingOption, removeFinancingOption,
        addCatalogItem, updateCatalogItem, deleteCatalogItemById,
        resetAllData
    };
}