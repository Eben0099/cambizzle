/**
 * Utilitaires pour la gestion des filtres d'annonces
 */

/**
 * Construit les query parameters pour l'API à partir des filtres sélectionnés
 * @param {Object} selectedFilters - Objet contenant les filtres sélectionnés
 * @returns {Object} - Objet de query parameters prêt pour l'API
 * 
 * @example
 * Input: { 1: "Rouge", 2: { min: 100000, max: 500000 }, 3: "XL" }
 * Output: { filter_1: "Rouge", filter_2_min: 100000, filter_2_max: 500000, filter_3: "XL" }
 */
export const buildFilterQueryParams = (selectedFilters) => {
  const queryParams = {};

  Object.entries(selectedFilters).forEach(([filterId, value]) => {
    // Ignorer les valeurs vides ou null
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Filtres spéciaux : location et price
    if (filterId === 'location') {
      queryParams['location'] = value;
      return;
    }

    if (filterId === 'price') {
      if (typeof value === 'object') {
        if (value.min !== null && value.min !== undefined && value.min !== '') {
          queryParams['price_min'] = value.min;
        }
        if (value.max !== null && value.max !== undefined && value.max !== '') {
          queryParams['price_max'] = value.max;
        }
      }
      return;
    }

    // Si c'est un objet avec min et/ou max (range)
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.min !== null && value.min !== undefined && value.min !== '') {
        queryParams[`filter_${filterId}_min`] = value.min;
      }
      if (value.max !== null && value.max !== undefined && value.max !== '') {
        queryParams[`filter_${filterId}_max`] = value.max;
      }
    }
    // Si c'est un array (checkboxes multiples)
    else if (Array.isArray(value)) {
      if (value.length > 0) {
        queryParams[`filter_${filterId}`] = value.join(',');
      }
    }
    // Valeur simple (select, radio, text, number)
    else {
      queryParams[`filter_${filterId}`] = value;
    }
  });

  return queryParams;
};

/**
 * Parse les query parameters de l'URL pour reconstruire l'objet selectedFilters
 * @param {URLSearchParams} searchParams - Les paramètres de l'URL
 * @returns {Object} - Objet selectedFilters reconstruit
 * 
 * @example
 * Input: URLSearchParams("filter_1=Rouge&filter_2_min=100000&filter_2_max=500000")
 * Output: { 1: "Rouge", 2: { min: "100000", max: "500000" } }
 */
export const parseFiltersFromURL = (searchParams) => {
  const selectedFilters = {};

  for (const [key, value] of searchParams.entries()) {
    // Filtre spécial : location
    if (key === 'location') {
      selectedFilters['location'] = value;
      continue;
    }

    // Filtre spécial : price_min et price_max
    if (key === 'price_min' || key === 'price_max') {
      if (!selectedFilters['price']) {
        selectedFilters['price'] = {};
      }
      const rangeType = key === 'price_min' ? 'min' : 'max';
      selectedFilters['price'][rangeType] = value;
      continue;
    }

    // Identifier les paramètres de filtres
    if (key.startsWith('filter_')) {
      const parts = key.replace('filter_', '').split('_');
      
      // filter_{id}_min ou filter_{id}_max
      if (parts.length === 2 && (parts[1] === 'min' || parts[1] === 'max')) {
        const filterId = parts[0];
        const rangeType = parts[1];
        
        if (!selectedFilters[filterId]) {
          selectedFilters[filterId] = {};
        }
        
        selectedFilters[filterId][rangeType] = value;
      }
      // filter_{id}
      else {
        const filterId = parts[0];
        
        // Si la valeur contient des virgules, c'est un array (checkboxes)
        if (value.includes(',')) {
          selectedFilters[filterId] = value.split(',');
        } else {
          selectedFilters[filterId] = value;
        }
      }
    }
  }

  return selectedFilters;
};

/**
 * Valide si un filtre a une valeur sélectionnée
 * @param {*} value - La valeur du filtre
 * @returns {boolean} - true si le filtre a une valeur
 */
export const hasFilterValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  if (typeof value === 'object') {
    return (value.min !== null && value.min !== undefined && value.min !== '') ||
           (value.max !== null && value.max !== undefined && value.max !== '');
  }
  
  return true;
};

/**
 * Compte le nombre de filtres actifs
 * @param {Object} selectedFilters - Objet contenant les filtres sélectionnés
 * @returns {number} - Nombre de filtres avec des valeurs
 */
export const countActiveFilters = (selectedFilters) => {
  return Object.values(selectedFilters).filter(hasFilterValue).length;
};

/**
 * Réinitialise tous les filtres
 * @returns {Object} - Objet vide de filtres
 */
export const resetFilters = () => {
  return {};
};

/**
 * Formate le nom d'un filtre pour l'affichage
 * @param {Object} filter - L'objet filtre
 * @param {*} value - La valeur sélectionnée
 * @returns {string} - Label formaté pour l'affichage
 */
export const formatFilterLabel = (filter, value) => {
  if (!filter || !value) return '';
  
  // Filtre spécial : price
  if (filter.id === 'price' && typeof value === 'object' && !Array.isArray(value)) {
    const parts = [];
    if (value.min) parts.push(`${value.min} XAF`);
    if (value.max) parts.push(`${value.max} XAF`);
    return `Price: ${parts.join(' - ')}`;
  }
  
  // Pour les ranges
  if (typeof value === 'object' && !Array.isArray(value)) {
    const parts = [];
    if (value.min) parts.push(`Min: ${value.min}`);
    if (value.max) parts.push(`Max: ${value.max}`);
    return `${filter.name}: ${parts.join(', ')}`;
  }
  
  // Pour les arrays (checkboxes)
  if (Array.isArray(value)) {
    return `${filter.name}: ${value.join(', ')}`;
  }
  
  // Pour les valeurs simples
  return `${filter.name}: ${value}`;
};
