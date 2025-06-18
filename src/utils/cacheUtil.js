// src/utils/cacheUtil.js
/**
 * A utility for managing caching of various resources including images,
 * equipment catalog data, and other application resources.
 */

// Image cache for preloaded equipment images
const imageCache = new Map();

// LocalStorage keys
const STORAGE_KEYS = {
  CATALOG: 'miami-water-catalog',
  PACKAGES: 'miami-water-packages',
  FINANCING: 'miami-water-financing',
  CACHE_VERSION: 'miami-water-cache-version',
  PREFERENCES: 'miami-water-preferences'
};

// Current cache version - increment when data structure changes
const CURRENT_CACHE_VERSION = '1.0.0';

/**
 * Check if cache version is current, if not clear caches
 */
export const validateCacheVersion = () => {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.CACHE_VERSION);
  
  if (storedVersion !== CURRENT_CACHE_VERSION) {
    // Clear localStorage items
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Update cache version
    localStorage.setItem(STORAGE_KEYS.CACHE_VERSION, CURRENT_CACHE_VERSION);
    
    // Clear image cache
    imageCache.clear();
    
    return false;
  }
  
  return true;
};

/**
 * Preload equipment images into memory cache
 * @param {Array} equipmentItems - Array of equipment items to preload images for
 */
export const preloadEquipmentImages = (equipmentItems = []) => {
  if (!Array.isArray(equipmentItems) || equipmentItems.length === 0) return;
  
  equipmentItems.forEach(item => {
    if (!item || !item.id) return;
    
    const imageFilename = item.imageFilename || `${item.id}.jpg`;
    const imagePath = `/images/equipment/${imageFilename}`;
    
    // Only preload if not already in cache
    if (!imageCache.has(imagePath)) {
      const img = new Image();
      img.src = imagePath;
      
      img.onload = () => {
        imageCache.set(imagePath, imagePath);
        console.log(`Cached image: ${imagePath}`);
      };
      
      img.onerror = () => {
        // Cache the placeholder on error
        imageCache.set(imagePath, '/images/equipment/placeholder.jpg');
        console.warn(`Failed to load image: ${imagePath}, using placeholder`);
      };
    }
  });
};

/**
 * Get image path for equipment with caching
 * @param {Object} item - Equipment item object
 * @returns {string} - Path to image or placeholder
 */
export const getEquipmentImagePath = (item) => {
  if (!item || !item.id) return '/images/equipment/placeholder.jpg';
  
  const filename = item.imageFilename || `${item.id}.jpg`;
  const imagePath = `/images/equipment/${filename}`;
  
  // Check cache first
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }
  
  // Not in cache, schedule for caching
  const img = new Image();
  img.src = imagePath;
  
  img.onload = () => {
    imageCache.set(imagePath, imagePath);
  };
  
  img.onerror = () => {
    imageCache.set(imagePath, '/images/equipment/placeholder.jpg');
  };
  
  return imagePath;
};

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} - Success status
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Parsed data or default
 */
export const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return defaultValue;
    return JSON.parse(serialized);
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Clear all cached data
 */
export const clearAllCaches = () => {
  // Clear localStorage
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Update cache version
  localStorage.setItem(STORAGE_KEYS.CACHE_VERSION, CURRENT_CACHE_VERSION);
  
  // Clear image cache
  imageCache.clear();
};

// Export storage keys for use in other files
export { STORAGE_KEYS };