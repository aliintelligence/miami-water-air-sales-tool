// src/utils/i18n.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Import translation files
import en from '../locales/en.json';
import es from '../locales/es.json';
import ht from '../locales/ht.json';

// Define available languages
export const LANGUAGES = {
  EN: 'en', // English
  ES: 'es', // Spanish
  HT: 'ht'  // Haitian Creole
};

// Default language
export const DEFAULT_LANGUAGE = LANGUAGES.EN;

// Combine all translations
const translations = {
  [LANGUAGES.EN]: en,
  [LANGUAGES.ES]: es,
  [LANGUAGES.HT]: ht
};

// Create context for language
export const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params) => key
});

// Create a provider component
export const LanguageProvider = ({ children }) => {
  // Try to get saved language from localStorage or use default
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      return Object.values(LANGUAGES).includes(savedLanguage) 
        ? savedLanguage 
        : DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Error reading language from localStorage:', error);
      return DEFAULT_LANGUAGE;
    }
  });

  // Save language preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
      // Also set lang attribute on html element for accessibility
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [language]);

  // Translation function
  const t = (key, params = {}) => {
    try {
      if (!key || typeof key !== 'string') {
        console.warn('Invalid translation key:', key);
        return key ? key.toString() : '';
      }

      // Split the key by dots to navigate nested objects
      const keys = key.split('.');
      
      // Start with the current language object
      let translationObj = translations[language];
      
      // Traverse the nested structure
      for (const k of keys) {
        // If at any point we can't go deeper, break
        if (!translationObj || typeof translationObj !== 'object') {
          break;
        }
        translationObj = translationObj[k];
      }

      // Get the translated text
      let text = typeof translationObj === 'string' ? translationObj : null;
      
      // If no translation found in current language, try English
      if (!text && language !== DEFAULT_LANGUAGE) {
        translationObj = translations[DEFAULT_LANGUAGE];
        // Traverse again in the default language
        for (const k of keys) {
          if (!translationObj || typeof translationObj !== 'object') {
            break;
          }
          translationObj = translationObj[k];
        }
        text = typeof translationObj === 'string' ? translationObj : null;
      }

      // If still no text, use the key as fallback
      if (!text) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
      
      // Replace parameters if any
      if (params && Object.keys(params).length) {
        Object.keys(params).forEach(param => {
          text = text.replace(`{{${param}}}`, params[param]);
        });
      }
      
      return text;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  // Context value
  const contextValue = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using translations
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  
  return context;
};

// Component for language switcher
export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useTranslation();
  
  return (
    <div className="language-switcher">
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="p-2 border rounded bg-white text-gray-800"
        aria-label="Select language"
      >
        <option value={LANGUAGES.EN}>{t('language.english')}</option>
        <option value={LANGUAGES.ES}>{t('language.spanish')}</option>
        <option value={LANGUAGES.HT}>{t('language.haitianCreole')}</option>
      </select>
    </div>
  );
};