import { useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour debounce
 * @param {Function} callback - Fonction à appeler après le délai
 * @param {number} delay - Délai en millisecondes
 * @returns {Function} - Fonction debouncée
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedCallback;
};
