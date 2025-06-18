// src/components/ConfigurationPanel/index.js
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBackend } from '../../hooks/useBackend';
import { useTranslation } from '../../utils/i18n';
import CatalogEditor from './CatalogEditor';
import PackageEditor from './PackageEditor';
import FinancingEditor from './FinancingEditor';
import DatabaseReset from './DatabaseReset';
import LoadingSpinner from '../common/LoadingSpinner';

function ConfigurationPanel() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  
  const {
    catalog, 
    packages, 
    financingOptions,
    loading,
    error,
    addPackage, 
    updatePackage, 
    removePackage,
    addFinancingOption, 
    updateFinancingOption, 
    removeFinancingOption,
    addCatalogItem, 
    updateCatalogItem, 
    deleteCatalogItemById,
    getAllEquipment,
    refreshData
  } = useBackend();

  // Flattened list for PackageEditor
  const allEquipmentFlat = useMemo(() => {
    if (getAllEquipment) {
      return getAllEquipment();
    }
    return [];
  }, [getAllEquipment]);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading configuration..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Error Loading Configuration</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">{t('admin.title')}</h2>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh Data
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            {t('navigation.back')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 ${activeTab === 'catalog' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-t-lg`}
          >
            {t('admin.tabs.catalog')}
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 ${activeTab === 'packages' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-t-lg`}
          >
            {t('admin.tabs.packages')}
          </button>
          <button
            onClick={() => setActiveTab('financing')}
            className={`px-4 py-2 ${activeTab === 'financing' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-t-lg`}
          >
            {t('admin.tabs.financing')}
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 ${activeTab === 'database' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-t-lg`}
          >
            Database
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        {activeTab === 'catalog' && (
          <CatalogEditor
            catalog={catalog || {}}
            addCatalogItem={addCatalogItem}
            updateCatalogItem={updateCatalogItem}
            deleteCatalogItemById={deleteCatalogItemById}
          />
        )}

        {activeTab === 'packages' && (
          <PackageEditor
            packages={packages || []}
            updatePackage={updatePackage}
            removePackage={removePackage}
            addPackage={addPackage}
            equipmentItems={allEquipmentFlat}
          />
        )}

        {activeTab === 'financing' && (
          <FinancingEditor
            financingOptions={financingOptions || []}
            addFinancingOption={addFinancingOption}
            updateFinancingOption={updateFinancingOption}
            removeFinancingOption={removeFinancingOption}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseReset />
        )}
      </div>

      {/* Backend Status */}
      <div className="mt-6 bg-blue-50 p-4 rounded">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              {t('admin.backendStatus', 'All changes are automatically saved to the cloud and synchronized with all users in real-time.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationPanel;