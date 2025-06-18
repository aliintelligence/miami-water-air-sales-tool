// src/components/ConfigurationPanel/DatabaseReset.js
import React, { useState } from 'react';
import { useTranslation } from '../../utils/i18n';
import LoadingSpinner from '../common/LoadingSpinner';
import { DatabaseService } from '../../services/databaseService';

function DatabaseReset() {
  const { t } = useTranslation();
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exportData, setExportData] = useState(null);

  const handleReset = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsResetting(true);
    setError(null);
    setResult(null);
    
    try {
      const resetResult = await DatabaseService.seedDatabase();
      setResult(resetResult);
      setShowConfirm(false);
      
      // Reload page after successful reset
      if (resetResult.errors.length === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      console.error('Database reset error:', err);
      setError(err.message || 'Failed to reset database');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await DatabaseService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miami-water-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await DatabaseService.importData(data);
      alert('Data imported successfully');
      window.location.reload();
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import data');
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Database Management</h3>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-3">
          Manage your database data - seed with defaults, export current data, or import from a backup.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Warning</h4>
              <p className="text-yellow-700 text-sm">
                Seeding will attempt to add all default data to the database. Existing items with the same IDs will not be duplicated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Actions */}
      <div className="space-y-4">
        {/* Seed Database */}
        <div>
          <h4 className="font-medium mb-2">Seed Database</h4>
          <p className="text-sm text-gray-600 mb-3">
            Populate the database with default equipment, packages, and financing options.
          </p>
          
          {/* Confirmation Dialog */}
          {showConfirm && !isResetting && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800 font-medium mb-3">
                Are you sure you want to seed the database with default data?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Seed Database
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showConfirm && !isResetting && !result && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Seed Database with Default Data
            </button>
          )}
        </div>

        {/* Export Data */}
        <div>
          <h4 className="font-medium mb-2">Export Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download all current data as a JSON file for backup purposes.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export Database
          </button>
        </div>

        {/* Import Data */}
        <div>
          <h4 className="font-medium mb-2">Import Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Import data from a previously exported JSON file.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </div>
      </div>

      {/* Loading State */}
      {isResetting && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="large" message="Seeding database... This may take a moment." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-4 mt-4">
          <p className="text-red-700 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Success State */}
      {result && (
        <div className={`p-4 rounded-lg mb-4 mt-4 ${result.errors.length > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <h4 className={`font-medium mb-2 ${result.errors.length > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
            Database Seed Results:
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            <li className="text-green-700">Equipment items created: {result.equipment}</li>
            <li className="text-green-700">Packages created: {result.packages}</li>
            <li className="text-green-700">Financing options created: {result.financing}</li>
          </ul>
          
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-red-700 font-medium">Errors encountered:</p>
              <ul className="list-disc pl-5 mt-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-red-600 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.errors.length === 0 && (
            <p className="text-green-700 mt-3 font-medium">
              All data seeded successfully! Page will reload in 3 seconds...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default DatabaseReset;