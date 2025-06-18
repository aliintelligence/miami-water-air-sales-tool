// src/components/ConfigurationPanel/FinancingEditor.js
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

function FinancingOptionEditor({ 
  option, 
  index, 
  updateFinancingOption, 
  removeFinancingOption,
  saving,
  setSaving,
  setError
}) {
  const [localOption, setLocalOption] = useState(option);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalOption(option);
  }, [option]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalOption(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle terms string
  const handleTermsChange = (e) => {
    const termsString = e.target.value;
    setLocalOption(prev => ({ ...prev, termsString }));
  };

  // Initialize terms string
  useEffect(() => {
    const termsStringForInput = Array.isArray(option.terms) ? option.terms.join(', ') : '';
    setLocalOption(prev => ({...prev, termsString: termsStringForInput}));
  }, [option.terms]);

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updatesToSave = { ...localOption };
      
      // Convert interest rate and payment factor to numbers
      if (updatesToSave.interestRate !== undefined) {
        updatesToSave.interestRate = updatesToSave.interestRate === '' ? null : parseFloat(updatesToSave.interestRate);
      }
      
      if (updatesToSave.paymentFactor !== undefined) {
        updatesToSave.paymentFactor = updatesToSave.paymentFactor === '' ? null : parseFloat(updatesToSave.paymentFactor);
      }
      
      // Handle terms conversion
      if (localOption.termsString !== undefined) {
        updatesToSave.terms = localOption.termsString;
        delete updatesToSave.termsString;
      }
      
      await updateFinancingOption(index, updatesToSave);
      setIsEditing(false);
    } catch (err) {
      setError(`Error updating financing option: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Remove option
  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove "${option.name}"?`)) {
      setSaving(true);
      setError(null);
      try {
        await removeFinancingOption(index);
      } catch (err) {
        setError(`Error removing financing option: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setLocalOption(option);
    setIsEditing(false);
  };

  // Format terms for display
  const formatTerms = (terms) => {
    if (!Array.isArray(terms) || terms.length === 0) return 'None';
    if (terms.includes(0)) return 'Revolving Account';
    return terms.join(', ') + ' months';
  };

  return (
    <div className="border p-4 mb-4 rounded shadow-md bg-white">
      {!isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-blue-700">{localOption.name || '(Unnamed Plan)'}</h5>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                disabled={saving}
              >
                Edit
              </button>
              <button 
                onClick={handleRemove}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                disabled={saving}
              >
                Remove
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-500">ID: <span className="text-gray-700">{localOption.id}</span></p>
              <p className="text-sm mt-1">
                <span className="font-medium">Description:</span> {localOption.description || 'No description'}
              </p>
            </div>
            
            <div>
              <p className="text-sm">
                <span className="font-medium">Interest Rate:</span> {
                  localOption.interestRate !== null && localOption.interestRate !== undefined
                    ? `${localOption.interestRate}%`
                    : 'N/A'
                }
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Terms:</span> {formatTerms(localOption.terms)}
              </p>
              {localOption.paymentFactor !== null && localOption.paymentFactor !== undefined && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Payment Factor:</span> {localOption.paymentFactor}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-blue-700">Edit: {localOption.name || '(Unnamed Plan)'}</h5>
            <div className="flex space-x-2">
              <button 
                onClick={handleSave}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                disabled={saving}
              >
                Save
              </button>
              <button 
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
              <input 
                type="text" 
                name="name" 
                value={localOption.name || ''} 
                onChange={handleChange} 
                className="w-full p-2 border rounded"
                disabled={saving}
              />

              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Description:</label>
              <textarea 
                name="description" 
                value={localOption.description || ''} 
                onChange={handleChange} 
                className="w-full p-2 border rounded" 
                rows="3"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%): <span className="text-xs text-gray-500">(Leave blank for N/A)</span>
              </label>
              <input 
                type="number" 
                name="interestRate" 
                value={localOption.interestRate ?? ''} 
                onChange={handleChange} 
                step="0.01" 
                placeholder="e.g., 9.99" 
                className="w-full p-2 border rounded"
                disabled={saving}
              />

              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Terms (comma-separated months):
              </label>
              <input 
                type="text" 
                name="termsString" 
                value={localOption.termsString || ''} 
                onChange={handleTermsChange} 
                placeholder="e.g., 12, 24, 36, 0" 
                className="w-full p-2 border rounded"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">Enter 0 for revolving plans</p>

              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Payment Factor: <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input 
                type="number" 
                name="paymentFactor" 
                value={localOption.paymentFactor ?? ''} 
                onChange={handleChange} 
                step="0.001" 
                placeholder="e.g., 0.01 for 1%" 
                className="w-full p-2 border rounded"
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancingEditor({ 
  financingOptions = [], 
  addFinancingOption, 
  updateFinancingOption, 
  removeFinancingOption 
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddOption = async () => {
    setSaving(true);
    setError(null);
    try {
      await addFinancingOption();
    } catch (err) {
      setError(`Error adding financing option: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {saving && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner size="medium" message="Saving..." />
        </div>
      )}
      
      {financingOptions.length === 0 && (
        <p className="text-gray-500 italic my-4">No financing options configured yet.</p>
      )}
      
      <div className="space-y-4">
        {financingOptions.map((option, index) => (
          <FinancingOptionEditor
            key={option.id || `fin-${index}`}
            option={option}
            index={index}
            updateFinancingOption={updateFinancingOption}
            removeFinancingOption={removeFinancingOption}
            saving={saving}
            setSaving={setSaving}
            setError={setError}
          />
        ))}
      </div>
      
      <button
        onClick={handleAddOption}
        className="mt-6 px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        disabled={saving}
      >
        + Add New Financing Option
      </button>
    </div>
  );
}

export default FinancingEditor;