import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';

i18n
  // Detects user language from browser or localStorage
  .use(LanguageDetector)
  // Passes i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ta: { translation: taTranslation }
    },
    fallbackLng: 'en',
    // We already escape in React, so interpolation is safe
    interpolation: {
      escapeValue: false 
    },
    detection: {
      // Store preferred language in localStorage
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
