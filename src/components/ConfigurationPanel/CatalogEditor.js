// src/components/ConfigurationPanel/CatalogEditor.js
import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const CatalogEditor = ({ 
  catalog, 
  updateCatalogItem, 
  addCatalogItem, 
  deleteCatalogItemById 
}) => { 
  const [activeCategory, setActiveCategory] = useState('conditioners');
  const [editMode, setEditMode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const categories = {
    conditioners: 'Water Conditioners',
    filters: 'Whole House Filters',
    drinkingWater: 'Drinking Water Systems',
    upgrades: 'System Upgrades',
    nonRainsoft: 'Non-RainSoft Products',
    addons: 'Special Add-ons'
  };

  const handleItemChange = async (category, index, field, value) => {
    setSaving(true);
    setError(null);
    try {
      let parsedValue = value;
      if (field === 'price' || field === 'packagePrice') {
        parsedValue = parseFloat(value) || 0;
      }
      await updateCatalogItem(category, index, field, parsedValue);
    } catch (err) {
      setError(`Error updating item: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = (itemId) => {
    setEditMode(editMode === itemId ? null : itemId);
  };

  const addNewItem = async (category) => {
    setSaving(true);
    setError(null);
    try {
      const id = `${category.charAt(0)}${Date.now()}`; 
      const newItem = {
        id, 
        name: 'New Item - Edit Me', 
        price: 0, 
        imageFilename: '',
        category: category === 'conditioners' ? 'conditioner' :
                  category === 'filters' ? 'filter' :
                  category === 'drinkingWater' ? 'drinking' :
                  category === 'upgrades' ? 'upgrade' :
                  category === 'addons' ? 'addon' : 'nonRainsoft'
      };
      
      if (category === 'filters' || category === 'drinkingWater' || category === 'nonRainsoft') { 
        newItem.packagePrice = 0; 
      }
      if (category === 'conditioners') { 
        newItem.type = 'EC5'; 
      }
      if (category === 'addons') { 
        newItem.subscriptionInfo = 'Describe subscription (e.g., 5 years included, $X/yr after)'; 
      }
      
      await addCatalogItem(category, newItem); 
      setEditMode(id); 
    } catch (err) {
      setError(`Error adding item: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (category, item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name || 'this item'}"? This action cannot be undone.`)) {
      setSaving(true);
      setError(null);
      try {
        await deleteCatalogItemById(category, item.id);
        if(editMode === item.id) { 
          setEditMode(null); 
        }
      } catch (err) {
        setError(`Error deleting item: ${err.message}`);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(categories).map(([key, label]) => ( 
          <button 
            key={key} 
            className={`px-4 py-2 rounded ${activeCategory === key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} 
            onClick={() => setActiveCategory(key)}
          >
            {label}
          </button> 
        ))}
      </div>
      
      <div className="relative">
        {saving && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <LoadingSpinner size="medium" message="Saving..." />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Image Filename</th> 
                <th className="py-2 px-4 border text-left">Price</th>
                {(activeCategory === 'filters' || activeCategory === 'drinkingWater' || activeCategory === 'nonRainsoft') && (
                  <th className="py-2 px-4 border text-left">Package Price</th>
                )}
                {activeCategory === 'conditioners' && (
                  <th className="py-2 px-4 border text-left">Type</th>
                )}
                {activeCategory === 'addons' && (
                  <th className="py-2 px-4 border text-left">Subscription Info</th>
                )}
                <th className="py-2 px-4 border text-left w-40">Actions</th> 
              </tr>
            </thead>
            <tbody>
              {catalog && catalog[activeCategory] && Array.isArray(catalog[activeCategory]) && catalog[activeCategory].map((item, index) => (
                <tr key={item.id || index} className="border-b hover:bg-gray-50"> 
                  <td className="py-2 px-4 border">
                    {editMode === item.id ? (
                      <input 
                        type="text" 
                        value={item.name || ''} 
                        onChange={(e) => handleItemChange(activeCategory, index, 'name', e.target.value)} 
                        className="w-full p-1 border"
                        disabled={saving}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="py-2 px-4 border">
                    {editMode === item.id ? ( 
                      <input 
                        type="text" 
                        value={item.imageFilename || ''} 
                        onChange={(e) => handleItemChange(activeCategory, index, 'imageFilename', e.target.value)} 
                        className="w-full p-1 border text-xs"
                        placeholder="e.g., product.jpg"
                        disabled={saving}
                      /> 
                    ) : ( 
                      <span className="text-xs">{item.imageFilename || '(uses ID)'}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border">
                    {editMode === item.id ? (
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input 
                          type="number" 
                          value={item.price ?? 0} 
                          onChange={(e) => handleItemChange(activeCategory, index, 'price', e.target.value)} 
                          className="w-full p-1 border" 
                          min="0" 
                          step="1"
                          disabled={saving}
                        />
                      </div>
                    ) : (
                      `$${(item.price || 0).toLocaleString()}`
                    )}
                  </td>
                  {(activeCategory === 'filters' || activeCategory === 'drinkingWater' || activeCategory === 'nonRainsoft') && (
                    <td className="py-2 px-4 border">
                      {editMode === item.id ? (
                        <div className="flex items-center">
                          <span className="mr-1">$</span>
                          <input 
                            type="number" 
                            value={item.packagePrice ?? 0} 
                            onChange={(e) => handleItemChange(activeCategory, index, 'packagePrice', e.target.value)} 
                            className="w-full p-1 border" 
                            min="0" 
                            step="1"
                            disabled={saving}
                          />
                        </div>
                      ) : (
                        item.packagePrice ? `$${item.packagePrice.toLocaleString()}` : 'N/A'
                      )}
                    </td>
                  )}
                  {activeCategory === 'conditioners' && (
                    <td className="py-2 px-4 border">
                      {editMode === item.id ? (
                        <select 
                          value={item.type || 'EC5'} 
                          onChange={(e) => handleItemChange(activeCategory, index, 'type', e.target.value)} 
                          className="w-full p-1 border"
                          disabled={saving}
                        >
                          <option value="EC5">EC5</option>
                          <option value="TCM">TCM</option>
                          <option value="Oxytech">Oxytech</option>
                        </select>
                      ) : (
                        item.type || 'N/A'
                      )}
                    </td>
                  )}
                  {activeCategory === 'addons' && (
                    <td className="py-2 px-4 border">
                      {editMode === item.id ? (
                        <input 
                          type="text" 
                          value={item.subscriptionInfo || ''} 
                          onChange={(e) => handleItemChange(activeCategory, index, 'subscriptionInfo', e.target.value)} 
                          className="w-full p-1 border" 
                          placeholder="e.g., First 5 years included, $99/year after"
                          disabled={saving}
                        />
                      ) : (
                        item.subscriptionInfo || 'N/A'
                      )}
                    </td>
                  )}
                  <td className="py-2 px-4 border">
                    <div className="flex gap-2"> 
                      <button 
                        onClick={() => toggleEditMode(item.id)} 
                        className={`px-3 py-1 rounded text-white text-xs ${editMode === item.id ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                        disabled={saving}
                      >
                        {editMode === item.id ? 'Save' : 'Edit'}
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(activeCategory, item)} 
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs"
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => addNewItem(activeCategory)} 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" 
          disabled={!catalog || !catalog[activeCategory] || saving}
        >
          Add New {categories[activeCategory] ? categories[activeCategory].slice(0, -1) : 'Item'}
        </button>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded text-sm">
        <h3 className="font-bold mb-2">Real-time Updates</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>All changes are automatically saved to the cloud database</li>
          <li>Updates appear instantly for all users (both admins and reps)</li>
          <li>Equipment marked as "deleted" is hidden but can be restored</li>
          <li>Images must still be uploaded manually to the public/images/equipment/ folder</li>
        </ul>
      </div>
    </div>
  );
};

export default CatalogEditor;