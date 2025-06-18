import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '../services/api';

export const useCatalog = () => {
  const [catalog, setCatalog] = useState({});
  const [packages, setPackages] = useState([]);
  const [financingOptions, setFinancingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [catalogData, packagesData, financingData] = await Promise.all([
        catalogService.getEquipment(),
        catalogService.getPackages(),
        catalogService.getFinancingOptions()
      ]);
      
      setCatalog(catalogData);
      setPackages(packagesData);
      setFinancingOptions(financingData);
    } catch (err) {
      console.error('Error loading catalog data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Equipment CRUD operations
  const addEquipment = async (categoryKey, equipment) => {
    try {
      const newEquipment = await catalogService.createEquipment({
        ...equipment,
        categoryKey
      });
      await loadData();
      return newEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  };

  const updateEquipment = async (id, updates) => {
    try {
      const updated = await catalogService.updateEquipment(id, updates);
      await loadData();
      return updated;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  };

  const deleteEquipment = async (id) => {
    try {
      await catalogService.deleteEquipment(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  };

  // Package CRUD operations
  const addPackage = async (pkg) => {
    try {
      const newPackage = await catalogService.createPackage(pkg);
      await loadData();
      return newPackage;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  };

  const updatePackage = async (id, updates) => {
    try {
      const updated = await catalogService.updatePackage(id, updates);
      await loadData();
      return updated;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  };

  const deletePackage = async (id) => {
    try {
      await catalogService.deletePackage(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  };

  // Financing option CRUD operations
  const addFinancingOption = async (option) => {
    try {
      const newOption = await catalogService.createFinancingOption(option);
      await loadData();
      return newOption;
    } catch (error) {
      console.error('Error creating financing option:', error);
      throw error;
    }
  };

  const updateFinancingOption = async (id, updates) => {
    try {
      const updated = await catalogService.updateFinancingOption(id, updates);
      await loadData();
      return updated;
    } catch (error) {
      console.error('Error updating financing option:', error);
      throw error;
    }
  };

  const deleteFinancingOption = async (id) => {
    try {
      await catalogService.deleteFinancingOption(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting financing option:', error);
      throw error;
    }
  };

  // Helper function to get all equipment
  const getAllEquipment = () => {
    const items = [];
    Object.values(catalog).forEach(categoryItems => {
      items.push(...categoryItems);
    });
    return items;
  };

  return {
    catalog,
    packages,
    financingOptions,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addPackage,
    updatePackage,
    deletePackage,
    addFinancingOption,
    updateFinancingOption,
    deleteFinancingOption,
    getAllEquipment,
    refreshData: loadData
  };
};

export default useCatalog;