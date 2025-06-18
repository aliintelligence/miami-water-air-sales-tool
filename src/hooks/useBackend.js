import { useState, useEffect, useCallback } from 'react';

// Use relative API URL in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

console.log('API_URL configured as:', API_URL);

export const useBackend = () => {
  const [catalog, setCatalog] = useState({});
  const [packages, setPackages] = useState([]);
  const [financingOptions, setFinancingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generic fetch helper
  const fetchData = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [equipmentData, packagesData, financingData] = await Promise.all([
        fetchData('/equipment'),
        fetchData('/packages'),
        fetchData('/financing-options')
      ]);
      
      setCatalog(equipmentData);
      setPackages(packagesData);
      setFinancingOptions(financingData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Equipment CRUD operations
  const addCatalogItem = async (categoryKey, item) => {
    try {
      const newItem = await fetchData('/equipment', {
        method: 'POST',
        body: JSON.stringify({ ...item, categoryKey })
      });
      
      // Reload data to maintain consistency
      await loadData();
      return newItem;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  };

  const updateCatalogItem = async (categoryKey, index, field, value) => {
    try {
      const items = catalog[categoryKey];
      if (!items || !items[index]) return;
      
      const item = items[index];
      const updated = await fetchData(`/equipment/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: value })
      });
      
      await loadData();
      return updated;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  };

  const deleteCatalogItemById = async (categoryKey, itemId) => {
    try {
      await fetchData(`/equipment/${itemId}`, {
        method: 'DELETE'
      });
      
      await loadData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  };

  // Similar implementations for packages and financing options...

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    catalog,
    packages,
    financingOptions,
    loading,
    error,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItemById,
    // ... other methods
    refreshData: loadData
  };
};