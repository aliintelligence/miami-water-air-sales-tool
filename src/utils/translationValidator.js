// src/utils/translationValidator.js
import en from '../locales/en.json';
import es from '../locales/es.json';
import ht from '../locales/ht.json';

/**
 * Recursively gets all translation keys from an object
 * @param {Object} obj - Translation object
 * @param {string} prefix - Key prefix for nested objects
 * @returns {Array} - Array of translation keys
 */
const getAllKeys = (obj, prefix = '') => {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = [...keys, ...getAllKeys(obj[key], fullKey)];
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
};

/**
 * Checks if a key exists in a translation object
 * @param {Object} obj - Translation object
 * @param {string} key - Key to check
 * @returns {boolean} - Whether the key exists
 */
const keyExists = (obj, key) => {
  const parts = key.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return typeof current === 'string';
};

/**
 * Validates translations across all languages
 * @returns {Object} - Validation results
 */
export const validateTranslations = () => {
  // Get all keys from English (base language)
  const enKeys = getAllKeys(en);
  
  // Check for missing keys in other languages
  const missingInSpanish = enKeys.filter(key => !keyExists(es, key));
  const missingInHaitian = enKeys.filter(key => !keyExists(ht, key));
  
  // Check for extra keys in other languages
  const esKeys = getAllKeys(es);
  const htKeys = getAllKeys(ht);
  
  const extraInSpanish = esKeys.filter(key => !keyExists(en, key));
  const extraInHaitian = htKeys.filter(key => !keyExists(en, key));
  
  const hasErrors = missingInSpanish.length > 0 || 
                    missingInHaitian.length > 0 || 
                    extraInSpanish.length > 0 || 
                    extraInHaitian.length > 0;
  
  return {
    hasErrors,
    missingInSpanish,
    missingInHaitian,
    extraInSpanish,
    extraInHaitian,
    totalKeys: enKeys.length
  };
};

/**
 * Logs the translation validation results to console
 */
export const logTranslationValidation = () => {
  const validation = validateTranslations();
  
  console.group('Translation Validation');
  console.log(`Total keys: ${validation.totalKeys}`);
  
  if (validation.missingInSpanish.length > 0) {
    console.warn(`Missing in Spanish (${validation.missingInSpanish.length}):`, validation.missingInSpanish);
  }
  
  if (validation.missingInHaitian.length > 0) {
    console.warn(`Missing in Haitian Creole (${validation.missingInHaitian.length}):`, validation.missingInHaitian);
  }
  
  if (validation.extraInSpanish.length > 0) {
    console.info(`Extra in Spanish (${validation.extraInSpanish.length}):`, validation.extraInSpanish);
  }
  
  if (validation.extraInHaitian.length > 0) {
    console.info(`Extra in Haitian Creole (${validation.extraInHaitian.length}):`, validation.extraInHaitian);
  }
  
  if (!validation.hasErrors) {
    console.log('✅ All translations are in sync!');
  }
  
  console.groupEnd();
  
  return validation;
};

// Run validation in development environment
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logTranslationValidation();
  }, 1000);
}