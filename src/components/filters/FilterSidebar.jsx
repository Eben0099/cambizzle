import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FilterSelect from './FilterSelect';
import FilterRadio from './FilterRadio';
import FilterCheckbox from './FilterCheckbox';
import FilterText from './FilterText';
import FilterNumber from './FilterNumber';
import FilterRange from './FilterRange';
import Button from '../ui/Button';
import { countActiveFilters } from '../../utils/filterHelpers';
import logger from '../../utils/logger';

/**
 * Composant sidebar pour afficher et gérer les filtres
 */
const FilterSidebar = ({
  filters = [],
  filterMetadata = { locations: [], priceRange: null },
  selectedFilters = {},
  onChange,
  onReset,
  onClose,
  loading = false
}) => {
  const { t } = useTranslation();

  // Rendu d'un filtre selon son type
  const renderFilter = (filter) => {
    const value = selectedFilters[filter.id];

    switch (filter.type) {
      case 'select':
        return <FilterSelect filter={filter} value={value} onChange={onChange} />;
      case 'radio':
        return <FilterRadio filter={filter} value={value} onChange={onChange} />;
      case 'checkbox':
        return <FilterCheckbox filter={filter} value={value} onChange={onChange} />;
      case 'text':
        return <FilterText filter={filter} value={value} onChange={onChange} />;
      case 'number':
        return <FilterNumber filter={filter} value={value} onChange={onChange} />;
      case 'range':
        return <FilterRange filter={filter} value={value} onChange={onChange} />;
      default:
        logger.warn(`Type de filtre non supporté: ${filter.type}`);
        return null;
    }
  };

  const activeFiltersCount = countActiveFilters(selectedFilters);

  // Debug locations
  logger.log('🗺️ FilterSidebar - filterMetadata:', filterMetadata);
  logger.log('🏙️ Locations disponibles:', filterMetadata?.locations);
  const cities = filterMetadata?.locations?.filter(loc => loc.type === 'city') || [];
  logger.log('🏙️ Villes filtrées:', cities);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" data-wg-notranslate="true">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('filters.filters')}</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-[#D6BA69] text-black text-xs font-medium px-2 py-1 rounded-full" suppressHydrationWarning>
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1 cursor-pointer"
              title={t('filters.resetFilters')}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('filters.clearFilters')}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 hover:text-gray-900 cursor-pointer"
              title={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters list */}
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Filtre de localisation */}
            {filterMetadata?.locations && filterMetadata.locations.length > 0 && (
              <div className="pb-4 border-b border-gray-100">
                <FilterSelect
                  filter={{
                    id: 'location',
                    name: t('filters.location'),
                    type: 'select',
                    options: filterMetadata.locations
                      .map((loc, index) => ({
                        id: loc.id || `loc-${index}`,
                        value: loc.city || loc.name
                      }))
                      .sort((a, b) => a.value.localeCompare(b.value))
                  }}
                  value={selectedFilters.location}
                  onChange={onChange}
                />
              </div>
            )}

            {/* Filtre de prix */}
            {filterMetadata?.priceRange && (
              <div className="pb-4 border-b border-gray-100">
                <FilterRange
                  filter={{
                    id: 'price',
                    name: t('filters.priceRange'),
                    type: 'range'
                  }}
                  value={selectedFilters.price}
                  onChange={onChange}
                />
              </div>
            )}

            {/* Filtres dynamiques de la sous-catégorie */}
            {Array.isArray(filters) && filters.length > 0 ? (
              filters
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((filter) => (
                  <div key={filter.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                    {renderFilter(filter)}
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">{t('filters.noAdditionalFilters')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with apply button for mobile */}
      {onClose && (
        <div className="p-4 border-t border-gray-200 lg:hidden">
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            {t('filters.applyFilters')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
