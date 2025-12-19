import { useEffect, useCallback } from 'react';
import WEGLOT_CONFIG from '../config/weglot';
import logger from '../utils/logger';

/**
 * Hook personnalisé pour forcer Weglot à retraiter le contenu
 * À utiliser après chaque chargement de contenu asynchrone
 */
export const useWeglotRetranslate = (dependencies = []) => {
  const retranslate = useCallback(() => {
    if (!window.Weglot) {
      logger.warn('Weglot not loaded');
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
          logger.log('Weglot content retranslated');
        } catch (error) {
          logger.error('Error retranslating:', error);
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
