import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
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

// Fonction pour changer de langue (utilisable partout)
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('i18nextLng', lang);

  // Aussi mettre à jour Weglot si disponible (pour le contenu dynamique)
  if (window.Weglot) {
    window.Weglot.switchTo(lang);
  }
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = () => {
  return i18n.language || localStorage.getItem('i18nextLng') || 'en';
};

export default i18n;
