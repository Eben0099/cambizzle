import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import WEGLOT_CONFIG from '../config/weglot';

/**
 * Weglot Provider Component
 * Initialise Weglot et force la traduction complète du contenu asynchrone
 */
const WeglotProvider = ({ children }) => {
  const scriptLoadedRef = useRef(false);
  const location = useLocation();
  const observerRef = useRef(null);
  const retranslateTimeoutRef = useRef(null);
  const lastTranslationTimeRef = useRef(0);

  // Fonction pour forcer Weglot à retraiter le DOM
  const forceWeglotRetranslate = useCallback((reason = '') => {
    if (!window.Weglot || !scriptLoadedRef.current) return;

    // Éviter les appels trop fréquents (max 1 par 200ms)
    const now = Date.now();
    if (now - lastTranslationTimeRef.current < 200) {
      return;
    }
    lastTranslationTimeRef.current = now;

    const currentLang = window.Weglot.getCurrentLanguage?.() || WEGLOT_CONFIG.originalLanguage;
    
    if (currentLang !== WEGLOT_CONFIG.originalLanguage) {
      // Nettoyer les timeouts précédents
      if (retranslateTimeoutRef.current) {
        clearTimeout(retranslateTimeoutRef.current);
      }

      // Planifier la retranslation
      retranslateTimeoutRef.current = setTimeout(() => {
        try {
          // Demander à Weglot de réappliquer les traductions
          if (window.Weglot.switchLanguage) {
            window.Weglot.switchLanguage(currentLang);
          } else if (window.Weglot.translateTo) {
            window.Weglot.translateTo(currentLang);
          }
          console.log(`🔄 Weglot retranslated: ${reason}`);
        } catch (error) {
          console.error('Error retranslating with Weglot:', error);
        }
      }, 100); // Délai court pour permettre au DOM de se stabiliser
    }
  }, []);

  // Charger le script Weglot une seule fois
  useEffect(() => {
    if (!WEGLOT_CONFIG.apiKey || WEGLOT_CONFIG.apiKey === 'wg_YOUR_API_KEY_HERE') {
      console.warn('⚠️ Weglot API key not configured. Please update src/config/weglot.js');
      return;
    }

    if (scriptLoadedRef.current && window.Weglot) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.weglot.com/weglot.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Weglot) {
        window.Weglot.initialize({
          api_key: WEGLOT_CONFIG.apiKey,
          originalLanguage: WEGLOT_CONFIG.originalLanguage,
          destinationLanguages: WEGLOT_CONFIG.destinationLanguages.map(lang => lang.code),
          ...WEGLOT_CONFIG.options
        });

        scriptLoadedRef.current = true;
        console.log('✅ Weglot initialized with languages:', WEGLOT_CONFIG.destinationLanguages.map(l => l.name).join(', '));
        
        // Mettre en place un observer pour détecter les changements de contenu asynchrone
        setupMutationObserver();
      }
    };

    script.onerror = () => {
      console.error('❌ Failed to load Weglot script');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retranslateTimeoutRef.current) {
        clearTimeout(retranslateTimeoutRef.current);
      }
    };
  }, []);

  // Mettre en place un MutationObserver agressif pour détecter tous les changements
  const setupMutationObserver = () => {
    const mainContent = document.querySelector('main') || document.body;
    
    const config = {
      childList: true,
      subtree: true,
      characterData: true, // Aussi surveiller les changements de texte
      characterDataOldValue: false,
      attributes: true, // Surveiller les changements d'attributs
      attributeFilter: ['title', 'placeholder', 'alt', 'aria-label', 'data-*']
    };

    let debounceTimer;
    const callback = () => {
      // Débounce: attendre que les mutations s'arrêtent
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        forceWeglotRetranslate('DOM mutation detected');
      }, 300);
    };

    observerRef.current = new MutationObserver(callback);
    observerRef.current.observe(mainContent, config);
  };

  // Réinitialiser les traductions à chaque changement de route
  useEffect(() => {
    // Attendre que le contenu de la nouvelle page se charge
    const timer = setTimeout(() => {
      forceWeglotRetranslate(`Route changed to: ${location.pathname}`);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname, forceWeglotRetranslate]);

  return <>{children}</>;
};

export default WeglotProvider;
