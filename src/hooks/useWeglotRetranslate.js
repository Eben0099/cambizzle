import { useEffect, useCallback } from 'react';
import WEGLOT_CONFIG from '../config/weglot';

/**
 * Hook personnalisé pour forcer Weglot à retraiter le contenu
 * À utiliser après chaque chargement de contenu asynchrone
 */
export const useWeglotRetranslate = (dependencies = []) => {
  const retranslate = useCallback(() => {
    if (!window.Weglot) {
      console.warn('Weglot not loaded');
      return;
    }

    const currentLang = window.Weglot.getCurrentLanguage?.() || WEGLOT_CONFIG.originalLanguage;
    
    if (currentLang !== WEGLOT_CONFIG.originalLanguage) {
      // Utiliser setTimeout pour s'assurer que le DOM est stable
      setTimeout(() => {
        try {
          if (window.Weglot.switchLanguage) {
            window.Weglot.switchLanguage(currentLang);
          } else if (window.Weglot.translateTo) {
            window.Weglot.translateTo(currentLang);
          }
          console.log('✨ Weglot content retranslated');
        } catch (error) {
          console.error('Error retranslating:', error);
        }
      }, 100);
    }
  }, []);

  // Retranslater quand les dépendances changent
  useEffect(() => {
    retranslate();
  }, dependencies);

  return retranslate;
};

export default useWeglotRetranslate;
