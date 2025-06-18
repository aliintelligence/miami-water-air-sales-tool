// src/components/LanguageSwitcher.js
import React from 'react';
import { useTranslation, LANGUAGES } from '../utils/i18n';

const LanguageSwitcher = () => {
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

export default LanguageSwitcher;