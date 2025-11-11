// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Importar traducciones directamente (opción simple)
import commonES from './locales/es/common.json';
import dashboardES from './locales/es/dashboard.json';
import teachersES from './locales/es/teachers.json';
import validationES from './locales/es/validation.json';

import commonEN from './locales/en/common.json';
import dashboardEN from './locales/en/dashboard.json';
import teachersEN from './locales/en/teachers.json';
import validationEN from './locales/en/validation.json';

const resources = {
  es: {
    common: commonES,
    dashboard: dashboardES,
    teachers: teachersES,
    validation: validationES
  },
  en: {
    common: commonEN,
    dashboard: dashboardEN,
    teachers: teachersEN,
    validation: validationEN
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    defaultNS: 'common',
    
    // Idiomas soportados
    supportedLngs: ['es', 'en'],
    
    // Detección de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'] // exclude de cache
    },

    interpolation: {
      escapeValue: false, // React ya se encarga de XSS
    },

    react: {
      useSuspense: false // Para no usar Suspense
    },

    // Debug solo en desarrollo
    debug: import.meta.env.MODE === 'development'
  });

export default i18n;