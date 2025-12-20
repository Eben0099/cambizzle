import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import i18n, { getPreferredLanguage } from '../i18n';
import WEGLOT_CONFIG from '../config/weglot';
import logger from '../utils/logger';

/**
 * Weglot Provider Component
 *
 * Gère l'initialisation de Weglot et la synchronisation avec i18n.
 * Le contenu dynamique est géré via le hook useWeglotRetranslate
 * qui utilise l'API Weglot.translate() pour traduire manuellement.
 */
const WeglotProvider = ({ children }) => {
  const scriptLoadedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const location = useLocation();

  // Initialize Weglot on mount
  useEffect(() => {
    // Skip if no API key
    if (!WEGLOT_CONFIG.apiKey || WEGLOT_CONFIG.apiKey === 'wg_YOUR_API_KEY_HERE') {
      logger.warn('Weglot API key not configured');
      return;
    }

    // Skip if already loaded or initializing
    if (scriptLoadedRef.current || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    const targetLang = getPreferredLanguage();
    logger.log(`Weglot: Target language is ${targetLang}`);

    // Create and load script immediately - no delay
    // Weglot's MutationObserver (configured in dashboard with "body") will handle dynamic content
    const script = document.createElement('script');
    script.src = 'https://cdn.weglot.com/weglot.min.js';
    script.async = true;

    script.onload = () => {
      if (!window.Weglot) {
        logger.error('Weglot script loaded but window.Weglot not available');
        return;
      }

      // Initialize Weglot with cache enabled
      window.Weglot.initialize({
        api_key: WEGLOT_CONFIG.apiKey,
        cache: true,
        wait_transition: false,
        hide_switcher: true, // Hide Weglot's native switcher, we use our own
        auto_switch: false, // Disable auto language detection redirect
        subdirectory: null // Disable URL subdirectory for languages
      });

      scriptLoadedRef.current = true;
      logger.log('Weglot initialized');

      // Wait for Weglot to be ready
      window.Weglot.on('initialized', () => {
        const currentWeglotLang = window.Weglot.getCurrentLang();
        logger.log(`Weglot ready - current: ${currentWeglotLang}, target: ${targetLang}`);

        // Switch to target language if different (without causing redirect)
        if (targetLang !== currentWeglotLang) {
          logger.log(`Switching Weglot to ${targetLang}`);
          window.Weglot.switchTo(targetLang);
        }
      });

      // Handle language changes from Weglot's native switcher (if visible)
      window.Weglot.on('languageChanged', (newLang) => {
        logger.log(`Weglot language changed to: ${newLang}`);

        // Sync with i18n
        const currentI18nLang = localStorage.getItem('i18nextLng');
        if (currentI18nLang !== newLang) {
          localStorage.setItem('i18nextLng', newLang);
          i18n.changeLanguage(newLang);
        }
      });
    };

    script.onerror = () => {
      logger.error('Failed to load Weglot script');
      isInitializingRef.current = false;
    };

    document.head.appendChild(script);
  }, []);

  return <>{children}</>;
};

export default WeglotProvider;
