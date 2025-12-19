import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import i18n, { getPreferredLanguage } from '../i18n';
import WEGLOT_CONFIG from '../config/weglot';
import logger from '../utils/logger';

/**
 * Weglot Provider Component
 *
 * IMPORTANT: Configure Weglot Dashboard > Settings > App Settings > Add Dynamic > "body"
 * This allows Weglot's MutationObserver to detect and translate dynamic content.
 */
const WeglotProvider = ({ children }) => {
  const scriptLoadedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const location = useLocation();

  // Re-scan when route changes (SPA navigation)
  useEffect(() => {
    if (window.Weglot && window.Weglot.initialized) {
      const currentLang = window.Weglot.getCurrentLang();
      logger.log(`Weglot: Route changed to ${location.pathname}, re-scanning for ${currentLang}`);

      // Small delay to let React render the new page content
      const timer = setTimeout(() => {
        window.Weglot.switchTo(currentLang);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

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
        wait_transition: true,
        hide_switcher: true // Hide Weglot's native switcher, we use our own
      });

      scriptLoadedRef.current = true;
      logger.log('Weglot initialized');

      // Wait for Weglot to be ready
      window.Weglot.on('initialized', () => {
        const currentWeglotLang = window.Weglot.getCurrentLang();
        logger.log(`Weglot ready - current: ${currentWeglotLang}, target: ${targetLang}`);

        // Switch to target language if different
        if (targetLang !== currentWeglotLang) {
          logger.log(`Switching Weglot to ${targetLang}`);
          window.Weglot.switchTo(targetLang);
        }

        // Force re-scan after content has likely loaded
        // This catches any content that loaded after initial Weglot scan
        setTimeout(() => {
          const lang = window.Weglot.getCurrentLang();
          logger.log(`Weglot: Forcing re-scan for language ${lang}`);
          // Switching to the same language forces Weglot to re-translate
          window.Weglot.switchTo(lang);
        }, 1500);
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
