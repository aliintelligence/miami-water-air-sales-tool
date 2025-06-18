// src/components/ConfigurationPanel/PackageEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

function SinglePackageEditor({ 
  pkg, 
  index, 
  updatePackage, 
  removePackage, 
  equipmentItems = [],
  saving,
  setSaving,
  setError
}) {
  const [localPackage, setLocalPackage] = useState(pkg);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state if the package prop changes externally
  useEffect(() => {
    setLocalPackage(pkg);
  }, [pkg]);

  // Calculate individual price based on selected items
  const calculateIndividualPrice = useCallback((itemIds) => {
    if (!Array.isArray(itemIds) || !Array.isArray(equipmentItems)) return 0;
    return itemIds.reduce((sum, itemId) => {
      const item = equipmentItems.find(eq => eq.id === itemId);
      return sum + (item?.price || 0);
    }, 0);
  }, [equipmentItems]);

  // Handle simple input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'packagePrice' ? (parseFloat(value) || 0) : value;
    setLocalPackage(prev => ({ ...prev, [name]: processedValue }));
  };

  // Handle item selection changes
  const handleItemToggle = (itemId) => {
    setLocalPackage(prev => {
      const currentItems = Array.isArray(prev.items) ? prev.items : [];
      let newItems;
      if (currentItems.includes(itemId)) {
        newItems = currentItems.filter(id => id !== itemId);
      } else {
        newItems = [...currentItems, itemId];
      }
      const newIndividualPrice = calculateIndividualPrice(newItems);
      return { ...prev, items: newItems, individualPrice: newIndividualPrice };
    });
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const finalIndividualPrice = calculateIndividualPrice(localPackage.items || []);
      await updatePackage(index, { ...localPackage, individualPrice: finalIndividualPrice });
      setIsEditing(false);
    } catch (err) {
      setError(`Error updating package: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete package
  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      setSaving(true);
      setError(null);
      try {
        await removePackage(index);
      } catch (err) {
        setError(`Error removing package: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setLocalPackage(pkg);
    setIsEditing(false);
  };

  // Get included item names
  const getIncludedItemNames = () => {
    if (!Array.isArray(localPackage.items) || !Array.isArray(equipmentItems)) {
      return [];
    }
    return localPackage.items.map(itemId => {
      const item = equipmentItems.find(eq => eq?.id === itemId);
      return item ? item.name : `Item #${itemId}`;
    });
  };

  return (
    <div className="border p-4 mb-4 rounded shadow-md bg-white">
      {!isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-blue-700">{localPackage.name || '(Unnamed Package)'}</h5>
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
              <p className="text-sm text-gray-500">ID: <span className="text-gray-700">{localPackage.id}</span></p>
              <p className="text-sm mt-1">
                <span className="font-medium">Package Price:</span> ${(localPackage.packagePrice || 0).toLocaleString()}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Individual Price:</span> ${(localPackage.individualPrice || 0).toLocaleString()}
              </p>
              <p className="text-sm mt-1 text-green-600">
                <span className="font-medium">Savings:</span> ${(
                  (localPackage.individualPrice || 0) - (localPackage.packagePrice || 0)
                ).toLocaleString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Includes:</p>
              <ul className="text-sm list-disc pl-5 max-h-32 overflow-y-auto">
                {getIncludedItemNames().map((name, idx) => (
                  <li key={idx} className="mb-1">{name}</li>
                ))}
                {getIncludedItemNames().length === 0 && (
                  <li className="text-gray-500 italic">No items selected</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-blue-700">Edit: {localPackage.name || '(Unnamed Package)'}</h5>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Name:</label>
              <input 
                type="text" 
                name="name" 
                value={localPackage.name || ''} 
                onChange={handleChange} 
                className="w-full p-2 border rounded"
                disabled={saving}
              />

              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Package Price:</label>
              <div className="flex items-center">
                <span className="mr-1 text-gray-500">$</span>
                <input 
                  type="number" 
                  name="packagePrice" 
                  value={localPackage.packagePrice ?? 0} 
                  onChange={handleChange} 
                  className="w-full p-2 border rounded" 
                  min="0" 
                  step="1"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Included Equipment:</label>
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                {equipmentItems.length > 0 ? equipmentItems.map(item => (
                  <div key={item.id} className="flex items-center my-1">
                    <input
                      type="checkbox"
                      id={`pkg-${index}-item-${item.id}`}
                      checked={localPackage.items?.includes(item.id) || false}
                      onChange={() => handleItemToggle(item.id)}
                      className="mr-2 h-4 w-4"
                      disabled={saving}
                    />
                    <label htmlFor={`pkg-${index}-item-${item.id}`} className="cursor-pointer">
                      {item.name} - ${item.price}
                    </label>
                  </div>
                )) : (
                  <p className="text-gray-500 italic">No equipment items available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageEditor({ 
  packages = [], 
  updatePackage, 
  removePackage, 
  addPackage, 
  equipmentItems = [] 
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddPackage = async () => {
    setSaving(true);
    setError(null);
    try {
      await addPackage();
    } catch (err) {
      setError(`Error adding package: ${err.message}`);
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
      
      {packages.length === 0 && (
        <p className="text-gray-500 italic my-4">No packages configured yet.</p>
      )}
      
      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <SinglePackageEditor
            key={pkg.id || `pkg-${index}`}
            pkg={pkg}
            index={index}
            updatePackage={updatePackage}
            removePackage={removePackage}
            equipmentItems={equipmentItems}
            saving={saving}
            setSaving={setSaving}
            setError={setError}
          />
        ))}
      </div>
      
      <button
        onClick={handleAddPackage}
        className="mt-6 px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        disabled={saving}
      >
        + Add New Package
      </button>
    </div>
  );
}

export default PackageEditor;