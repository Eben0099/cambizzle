import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr }
};

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'fr'];

/**
 * Get the preferred language based on:
 * 1. Saved preference in localStorage
 * 2. Browser language
 * 3. Default to 'fr' (French)
 */
export const getPreferredLanguage = () => {
  // First check localStorage
  const saved = localStorage.getItem('i18nextLng');
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
    return saved;
  }

  // Then check browser language
  const browserLang = navigator.language?.split('-')[0];
  if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang;
  }

  // Default to French
  return 'fr';
};

// Get initial language before i18n init
const initialLanguage = getPreferredLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Set the initial language explicitly
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

// Save the initial language if not already saved
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', initialLanguage);
}

/**
 * Change language for both i18n (static) and Weglot (dynamic)
 * @param {string} lang - Language code ('en' or 'fr')
 */
export const changeLanguage = (lang) => {
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    console.warn(`Unsupported language: ${lang}`);
    return;
  }

  // Update i18n
  i18n.changeLanguage(lang);
  localStorage.setItem('i18nextLng', lang);

  // Update Weglot if available
  if (window.Weglot && window.Weglot.switchTo) {
    window.Weglot.switchTo(lang);
  }
};

/**
 * Get current language
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language || localStorage.getItem('i18nextLng') || 'en';
};

export default i18n;
