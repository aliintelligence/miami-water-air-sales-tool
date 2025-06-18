import React from 'react';

const PackageSelector = ({ 
  isOpen, 
  onClose, 
  packages = [], 
  onSelectPackage,
  equipment = []
}) => {
  if (!isOpen) return null;
  
  // Helper function to get equipment names for display
  const getEquipmentNames = (itemIds) => {
    if (!Array.isArray(itemIds) || !itemIds.length || !Array.isArray(equipment) || !equipment.length) {
      return [];
    }
    
    return itemIds.map(id => {
      // Find the item by id in the flattened equipment array
      const item = equipment.find(e => e && e.id === id);
      return item ? item.name : `Item #${id}`;
    });
  };

  // Calculate savings percentage for each package
  const calculateSavingsPercent = (pkg) => {
    if (!pkg || !pkg.individualPrice || !pkg.packagePrice || pkg.individualPrice <= 0) {
      return 0;
    }
    return Math.round(((pkg.individualPrice - pkg.packagePrice) / pkg.individualPrice) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <h3 className="text-2xl font-bold">Featured Package Deals</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {packages && packages.length > 0 ? (
            <div className="space-y-6">
              {packages.map(pkg => pkg && (
                <div key={pkg.id || Math.random()} className="border-2 rounded-xl overflow-hidden hover:border-blue-400 transition-colors bg-white shadow-md">
                  {/* Package header with savings badge */}
                  <div className="bg-gray-50 p-4 border-b relative">
                    {calculateSavingsPercent(pkg) > 0 && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Save {calculateSavingsPercent(pkg)}%
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-blue-700 pr-20">{pkg.name || 'Unnamed Package'}</h4>
                    {pkg.description && (
                      <p className="text-gray-600 mt-1">{pkg.description}</p>
                    )}
                  </div>
                  
                  {/* Package content */}
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      {/* Included items */}
                      <div className="mb-4 sm:mb-0 flex-1">
                        <p className="font-medium text-gray-700 mb-2">This package includes:</p>
                        <ul className="list-disc ml-5 space-y-2">
                          {pkg.items && Array.isArray(pkg.items) ? 
                            getEquipmentNames(pkg.items).map((name, idx) => (
                              <li key={idx} className="text-lg">{name}</li>
                            )) : 
                            <li className="text-lg text-gray-500">No items specified</li>
                          }
                        </ul>
                      </div>
                      
                      {/* Price comparison */}
                      <div className="bg-blue-50 p-4 rounded-xl text-right min-w-[180px]">
                        {typeof pkg.individualPrice === 'number' && (
                          <div className="text-lg text-gray-500 line-through">
                            ${pkg.individualPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="font-bold text-2xl text-green-600 mb-1">
                          ${(pkg.packagePrice || 0).toLocaleString()}
                        </div>
                        {typeof pkg.individualPrice === 'number' && typeof pkg.packagePrice === 'number' && (
                          <div className="text-base text-green-600 font-medium">
                            Save ${(pkg.individualPrice - pkg.packagePrice).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Benefits section */}
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm">
                      <p className="font-medium text-yellow-800">Package Benefits:</p>
                      <ul className="list-disc ml-5 mt-1 space-y-1 text-yellow-800">
                        <li>Complete water treatment solution</li>
                        <li>Discounted bundle pricing</li>
                        <li>Simplified installation</li>
                        <li>Coordinated system components</li>
                      </ul>
                    </div>
                    
                    {/* Select button */}
                    <button 
                      onClick={() => onSelectPackage(pkg)}
                      className="w-full mt-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Select This Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-xl text-gray-500">No package deals available</p>
              <p className="text-gray-400 mt-2">Try creating custom equipment selections instead</p>
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-5 py-3 bg-gray-500 text-white rounded-lg text-base font-medium hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <p className="text-sm text-gray-600 italic">
            All packages include professional installation
          </p>
        </div>
      </div>
    </div>
  );
};

export default PackageSelector;