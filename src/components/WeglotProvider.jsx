import { useEffect } from 'react';
import WEGLOT_CONFIG from '../config/weglot';

/**
 * Weglot Provider Component
 * Initialise Weglot pour la traduction du site via script
 */
const WeglotProvider = ({ children }) => {
  useEffect(() => {
    // Vérifier si l'API Key est configurée
    if (!WEGLOT_CONFIG.apiKey || WEGLOT_CONFIG.apiKey === 'wg_YOUR_API_KEY_HERE') {
      console.warn('⚠️ Weglot API key not configured. Please update src/config/weglot.js');
      return;
    }

    // Charger le script Weglot
    const script = document.createElement('script');
    script.src = 'https://cdn.weglot.com/weglot.min.js';
    script.async = true;
    
    script.onload = () => {
      // Initialiser Weglot une fois le script chargé
      if (window.Weglot) {
        window.Weglot.initialize({
          api_key: WEGLOT_CONFIG.apiKey,
          originalLanguage: WEGLOT_CONFIG.originalLanguage,
          destinationLanguages: WEGLOT_CONFIG.destinationLanguages.map(lang => lang.code),
          ...WEGLOT_CONFIG.options
        });

        console.log('✅ Weglot initialized with languages:', WEGLOT_CONFIG.destinationLanguages.map(l => l.name).join(', '));
      }
    };

    script.onerror = () => {
      console.error('❌ Failed to load Weglot script');
    };

    document.head.appendChild(script);

    // Cleanup: retirer le script lors du démontage
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
};

export default WeglotProvider;
