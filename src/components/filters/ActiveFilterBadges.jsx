import React from 'react';
import { X } from 'lucide-react';
import { formatFilterLabel, hasFilterValue } from '../../utils/filterHelpers';

/**
 * Composant pour afficher les badges des filtres actifs
 */
const ActiveFilterBadges = ({ filters = [], selectedFilters = {}, onRemoveFilter }) => {
  // Vérifier que filters est un tableau
  const filtersArray = Array.isArray(filters) ? filters : [];
  
  // Créer une liste complète incluant les filtres spéciaux (location et price)
  const allFilters = [...filtersArray];
  
  // Ajouter le filtre location si sélectionné
  if (selectedFilters.location) {
    allFilters.push({ id: 'location', name: 'Location', type: 'select' });
  }
  
  // Ajouter le filtre price si sélectionné
  if (selectedFilters.price && hasFilterValue(selectedFilters.price)) {
    allFilters.push({ id: 'price', name: 'Price', type: 'range' });
  }
  
  // Filtrer les filtres qui ont une valeur
  const activeFilters = allFilters.filter(filter => 
    hasFilterValue(selectedFilters[filter.id])
  );

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4" translate="no">
      {activeFilters.map(filter => {
        const value = selectedFilters[filter.id];
        const label = formatFilterLabel(filter, value);
        
        return (
          <div
            key={filter.id}
            className="inline-flex items-center space-x-2 bg-[#D6BA69]/10 text-gray-800 px-3 py-1 rounded-full text-sm border border-[#D6BA69]/20"
            suppressHydrationWarning
          >
            <span suppressHydrationWarning>{label}</span>
            <button
              onClick={() => onRemoveFilter(filter.id)}
              className="hover:bg-[#D6BA69]/20 rounded-full p-0.5 transition-colors"
              title="Remove filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveFilterBadges;
