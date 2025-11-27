import React from 'react';
import { X } from 'lucide-react';
import { formatFilterLabel, hasFilterValue } from '../../utils/filterHelpers';

/**
 * Composant pour afficher les badges des filtres actifs
 */
const ActiveFilterBadges = ({ filters = [], selectedFilters = {}, onRemoveFilter }) => {
  // Filtrer les filtres qui ont une valeur
  const activeFilters = filters.filter(filter => 
    hasFilterValue(selectedFilters[filter.id])
  );

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map(filter => {
        const value = selectedFilters[filter.id];
        const label = formatFilterLabel(filter, value);
        
        return (
          <div
            key={filter.id}
            className="inline-flex items-center space-x-2 bg-[#D6BA69]/10 text-gray-800 px-3 py-1 rounded-full text-sm border border-[#D6BA69]/20"
          >
            <span>{label}</span>
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
