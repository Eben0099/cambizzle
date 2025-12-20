import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import AdCard from '../components/ads/AdCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FilterSidebar from '../components/filters/FilterSidebar';
import ActiveFilterBadges from '../components/filters/ActiveFilterBadges';
import { buildFilterQueryParams, parseFiltersFromURL, resetFilters, countActiveFilters } from '../utils/filterHelpers';
import { useAdsBySubcategory, useSubcategoryFilters, useAdCreationData } from '../hooks/useAdsQuery';
import { useWeglotTranslate } from '../hooks/useWeglotRetranslate';

// Composant pour traduire le titre dynamique
const TranslatedTitle = ({ title }) => {
  const { translatedText } = useWeglotTranslate(title || '');
  return <>{translatedText || title}</>;
};

const SubcategoryAds = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');

  // Construire les paramètres pour l'API (filtres backend seulement)
  const frontendFilters = ['location', 'price'];
  const backendFilters = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedFilters).filter(([key]) => !frontendFilters.includes(key))
    );
  }, [selectedFilters]);

  const queryParams = useMemo(() => ({
    page: 1,
    per_page: 20,
    ...buildFilterQueryParams(backendFilters)
  }), [backendFilters]);

  // React Query hooks
  const { data: creationData } = useAdCreationData();

  const {
    data: filtersData,
    isLoading: filtersLoading
  } = useSubcategoryFilters(subcategoryParam);

  const {
    data: subcategoryAds,
    isLoading: loading,
    error,
    refetch
  } = useAdsBySubcategory(subcategoryParam, queryParams);

  // Parser les filtres depuis les données API
  const { filters, filterMetadata } = useMemo(() => {
    if (!filtersData) {
      return { filters: [], filterMetadata: { locations: [], priceRange: null } };
    }

    if (Array.isArray(filtersData)) {
      // Ancien format : tableau direct
      return {
        filters: filtersData,
        filterMetadata: { locations: [], priceRange: null }
      };
    } else if (filtersData.filters && Array.isArray(filtersData.filters)) {
      // Nouveau format : objet avec filters et metadata
      return {
        filters: filtersData.filters,
        filterMetadata: {
          locations: filtersData.metadata?.locations || [],
          priceRange: filtersData.metadata?.priceRange || null
        }
      };
    }

    return { filters: [], filterMetadata: { locations: [], priceRange: null } };
  }, [filtersData]);

  // Initialise les filtres sélectionnés depuis l'URL au chargement
  useEffect(() => {
    const filtersFromURL = parseFiltersFromURL(searchParams);
    setSelectedFilters(filtersFromURL);
  }, []); // Ne s'exécute qu'une fois au montage

  // Gère le changement d'un filtre
  const handleFilterChange = (filterId, value) => {
    const newSelectedFilters = {
      ...selectedFilters,
      [filterId]: value
    };

    // Supprimer le filtre si la valeur est vide
    if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newSelectedFilters[filterId];
    }

    setSelectedFilters(newSelectedFilters);
    updateURLWithFilters(newSelectedFilters);
  };

  // Réinitialise tous les filtres
  const handleResetFilters = () => {
    const emptyFilters = resetFilters();
    setSelectedFilters(emptyFilters);

    // Nettoyer l'URL
    const newParams = new URLSearchParams();
    if (subcategoryParam) newParams.set('subcategory', subcategoryParam);
    if (categoryParam) newParams.set('category', categoryParam);
    setSearchParams(newParams);
  };

  // Supprime un filtre individuel
  const handleRemoveFilter = (filterId) => {
    const newSelectedFilters = { ...selectedFilters };
    delete newSelectedFilters[filterId];
    setSelectedFilters(newSelectedFilters);
    updateURLWithFilters(newSelectedFilters);
  };

  // Met à jour l'URL avec les filtres sélectionnés
  const updateURLWithFilters = (filters) => {
    const newParams = new URLSearchParams();

    // Conserver les paramètres de base
    if (subcategoryParam) newParams.set('subcategory', subcategoryParam);
    if (categoryParam) newParams.set('category', categoryParam);

    // Ajouter les filtres
    const filterParams = buildFilterQueryParams(filters);
    Object.entries(filterParams).forEach(([key, value]) => {
      newParams.set(key, value);
    });

    setSearchParams(newParams);
  };

  // Fonction de filtrage côté frontend pour location et price
  const filterAds = (adsArray, filters) => {
    if (!adsArray || adsArray.length === 0) return [];
    if (!filters || Object.keys(filters).length === 0) return adsArray;

    return adsArray.filter(ad => {
      // Filtre localisation
      if (filters.location) {
        const locationQuery = filters.location.toLowerCase().trim();
        const adLocationName = (ad.locationName || '').toLowerCase();
        if (!adLocationName.includes(locationQuery)) {
          return false;
        }
      }

      // Filtre prix (si c'est un objet avec min/max)
      if (filters.price) {
        if (filters.price.min && ad.price) {
          const minPrice = parseFloat(filters.price.min);
          const adPrice = parseFloat(ad.price);
          if (adPrice < minPrice) {
            return false;
          }
        }
        if (filters.price.max && ad.price) {
          const maxPrice = parseFloat(filters.price.max);
          const adPrice = parseFloat(ad.price);
          if (adPrice > maxPrice) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Tri et filtrage des annonces avec useMemo
  const displayedAds = useMemo(() => {
    const rawAds = subcategoryAds?.ads || [];
    const filteredAds = filterAds(rawAds, selectedFilters);

    if (!filteredAds || filteredAds.length === 0) return [];

    const sortedAds = [...filteredAds];

    switch (sortBy) {
      case 'price-asc':
        return sortedAds.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
      case 'price-desc':
        return sortedAds.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
      case 'popular':
        return sortedAds.sort((a, b) => (parseInt(b.viewCount) || 0) - (parseInt(a.viewCount) || 0));
      case 'recent':
      default:
        return sortedAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [subcategoryAds?.ads, selectedFilters, sortBy]);

  const displayInfo = {
    title: subcategoryAds?.subcategory?.name || `Ads in "${subcategoryParam}"`,
    count: subcategoryAds?.pagination?.total || displayedAds.length,
    subcategoryInfo: subcategoryAds?.subcategory,
    categoryInfo: subcategoryAds?.category
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <TranslatedTitle title={displayInfo.title} />
          </h1>
          <p className="text-gray-600">
            {displayInfo.count} {t('filters.adsFound', { count: displayInfo.count })}
          </p>

          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {t('common.error')}: {error.message || t('errors.loadFailed')}
            </div>
          )}
        </div>

        {/* Layout avec sidebar et contenu */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtres - Desktop */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                filterMetadata={filterMetadata}
                selectedFilters={selectedFilters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                loading={filtersLoading}
              />
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Bouton filtres mobile */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="w-full flex items-center justify-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t('filters.filters')}</span>
                {countActiveFilters(selectedFilters) > 0 && (
                  <span className="bg-[#D6BA69] text-black text-xs font-medium px-2 py-1 rounded-full">
                    {countActiveFilters(selectedFilters)}
                  </span>
                )}
              </Button>
            </div>

            {/* Badges de filtres actifs */}
            <ActiveFilterBadges
              filters={filters}
              selectedFilters={selectedFilters}
              onRemoveFilter={handleRemoveFilter}
            />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] cursor-pointer"
                  >
                    <option value="recent">{t('filters.newest')}</option>
                    <option value="price-asc">{t('filters.priceLowHigh')}</option>
                    <option value="price-desc">{t('filters.priceHighLow')}</option>
                    <option value="popular">{t('filters.mostPopular')}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Card className="text-center py-12">
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('errors.loadingAds')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error.message || t('errors.loadFailed')}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => refetch()}
                  >
                    {t('common.tryAgain')}
                  </Button>
                </div>
              </Card>
            ) : displayedAds.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {displayedAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              </>
            ) : (
              <Card className="text-center py-12">
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('home.noAdsFound')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {countActiveFilters(selectedFilters) > 0
                      ? t('filters.noMatchingAds')
                      : t('common.noAdsInCategory')}
                  </p>
                  {countActiveFilters(selectedFilters) > 0 && (
                    <Button
                      variant="primary"
                      onClick={handleResetFilters}
                    >
                      {t('filters.resetFilters')}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal filtres mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <FilterSidebar
              filters={filters}
              filterMetadata={filterMetadata}
              selectedFilters={selectedFilters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onClose={() => setShowMobileFilters(false)}
              loading={filtersLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryAds;
