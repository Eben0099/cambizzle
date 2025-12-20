import { useCallback, useRef, useState, useEffect } from 'react';
import WEGLOT_CONFIG from '../config/weglot';
import logger from '../utils/logger';

/**
 * Hook pour traduire manuellement du contenu dynamique avec Weglot
 *
 * Utilise l'API Weglot.translate() pour obtenir les traductions
 * et les stocke dans le state React.
 */
export const useWeglotTranslate = (originalText, options = {}) => {
  const { enabled = true } = options;
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isTranslating, setIsTranslating] = useState(false);
  const lastOriginalRef = useRef('');
  const lastLangRef = useRef('');

  useEffect(() => {
    // Si pas de texte ou désactivé, retourner l'original
    if (!originalText || !enabled) {
      setTranslatedText(originalText);
      return;
    }

    // Vérifier si Weglot est prêt
    if (!window.Weglot || !window.Weglot.initialized) {
      setTranslatedText(originalText);
      return;
    }

    const currentLang = window.Weglot.getCurrentLang?.();

    // Si on est en langue originale, pas besoin de traduire
    if (!currentLang || currentLang === WEGLOT_CONFIG.originalLanguage) {
      setTranslatedText(originalText);
      return;
    }

    // Éviter de re-traduire le même contenu pour la même langue
    if (lastOriginalRef.current === originalText && lastLangRef.current === currentLang) {
      return;
    }

    lastOriginalRef.current = originalText;
    lastLangRef.current = currentLang;
    setIsTranslating(true);

    logger.log(`Weglot: Translating "${originalText.substring(0, 30)}..." to ${currentLang}`);

    try {
      window.Weglot.translate(
        {
          words: [{ t: 1, w: originalText }],
          languageTo: currentLang
        },
        (translations) => {
          setIsTranslating(false);
          if (translations && translations.length > 0 && translations[0]) {
            logger.log(`Weglot: Translated to "${translations[0].substring(0, 30)}..."`);
            setTranslatedText(translations[0]);
          } else {
            setTranslatedText(originalText);
          }
        }
      );
    } catch (error) {
      logger.error('Weglot translate error:', error);
      setIsTranslating(false);
      setTranslatedText(originalText);
    }
  }, [originalText, enabled]);

  // Re-traduire quand la langue change
  useEffect(() => {
    const handleLanguageChange = (newLang) => {
      if (originalText && newLang !== WEGLOT_CONFIG.originalLanguage) {
        lastLangRef.current = ''; // Force re-translation
      } else {
        setTranslatedText(originalText);
      }
    };

    if (window.Weglot) {
      window.Weglot.on?.('languageChanged', handleLanguageChange);
      return () => {
        window.Weglot.off?.('languageChanged', handleLanguageChange);
      };
    }
  }, [originalText]);

  return { translatedText, isTranslating };
};

/**
 * Hook pour traduire un tableau d'objets avec Weglot
 * Utile pour les options de select
 *
 * @param {Array} items - Tableau d'objets avec une propriété à traduire
 * @param {string} textKey - Clé de la propriété à traduire (ex: 'name', 'city')
 * @returns {Object} - { translatedItems, isTranslating }
 */
export const useWeglotTranslateArray = (items, textKey = 'name') => {
  const [translatedItems, setTranslatedItems] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const lastItemsRef = useRef(null);
  const lastLangRef = useRef('');

  useEffect(() => {
    if (!items || items.length === 0) {
      setTranslatedItems([]);
      return;
    }

    // Vérifier si Weglot est prêt
    if (!window.Weglot || !window.Weglot.initialized) {
      setTranslatedItems(items);
      return;
    }

    const currentLang = window.Weglot.getCurrentLang?.();

    // Si on est en langue originale, pas besoin de traduire
    if (!currentLang || currentLang === WEGLOT_CONFIG.originalLanguage) {
      setTranslatedItems(items);
      return;
    }

    // Créer une clé unique pour comparer les items
    const itemsKey = JSON.stringify(items.map(item => item[textKey]));

    // Éviter de re-traduire les mêmes items pour la même langue
    if (lastItemsRef.current === itemsKey && lastLangRef.current === currentLang) {
      return;
    }

    lastItemsRef.current = itemsKey;
    lastLangRef.current = currentLang;
    setIsTranslating(true);

    // Préparer les mots à traduire
    const words = items.map(item => ({ t: 1, w: item[textKey] || '' }));

    try {
      window.Weglot.translate(
        {
          words: words,
          languageTo: currentLang
        },
        (translations) => {
          setIsTranslating(false);
          if (translations && translations.length === items.length) {
            // Créer de nouveaux objets avec les traductions
            const newItems = items.map((item, index) => ({
              ...item,
              [textKey]: translations[index] || item[textKey],
              [`original_${textKey}`]: item[textKey] // Garder l'original
            }));
            setTranslatedItems(newItems);
          } else {
            setTranslatedItems(items);
          }
        }
      );
    } catch (error) {
      logger.error('Weglot translate array error:', error);
      setIsTranslating(false);
      setTranslatedItems(items);
    }
  }, [items, textKey]);

  // Re-traduire quand la langue change
  useEffect(() => {
    const handleLanguageChange = () => {
      lastItemsRef.current = null; // Force re-translation
      lastLangRef.current = '';
    };

    if (window.Weglot) {
      window.Weglot.on?.('languageChanged', handleLanguageChange);
      return () => {
        window.Weglot.off?.('languageChanged', handleLanguageChange);
      };
    }
  }, []);

  return { translatedItems, isTranslating };
};

/**
 * Hook legacy pour compatibilité
 */
export const useWeglotRetranslate = () => {
  const triggerRetranslate = useCallback(() => {
    // No-op, kept for compatibility
  }, []);

  const reset = useCallback(() => {
    // No-op, kept for compatibility
  }, []);

  return { triggerRetranslate, reset };
};

export default useWeglotTranslate;
