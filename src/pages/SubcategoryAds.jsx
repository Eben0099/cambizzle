import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import AdCard from '../components/ads/AdCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SEO from '../components/SEO';
import { BreadcrumbSchema } from '../components/StructuredData';
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Construire les paramètres pour l'API (filtres backend seulement)
  const frontendFilters = ['location', 'price'];
  const backendFilters = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedFilters).filter(([key]) => !frontendFilters.includes(key))
    );
  }, [selectedFilters]);

  const queryParams = useMemo(() => ({
    page,
    per_page: 50,
    ...buildFilterQueryParams(backendFilters)
  }), [backendFilters, page]);

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

  // Pagination
  const pagination = subcategoryAds?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrevious: false
  };

  const goToPage = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNumber.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Tri et filtrage des annonces avec useMemo (tri par défaut: récent)
  const displayedAds = useMemo(() => {
    const rawAds = subcategoryAds?.ads || [];
    const filteredAds = filterAds(rawAds, selectedFilters);

    if (!filteredAds || filteredAds.length === 0) return [];

    // Tri par défaut: plus récent
    return [...filteredAds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [subcategoryAds?.ads, selectedFilters]);

  const displayInfo = {
    title: subcategoryAds?.subcategory?.name || `Ads in ${subcategoryParam}`,
    count: subcategoryAds?.pagination?.total || displayedAds.length,
    subcategoryInfo: subcategoryAds?.subcategory,
    categoryInfo: subcategoryAds?.category
  };

  // SEO data
  const subcategoryName = displayInfo.subcategoryInfo?.name || subcategoryParam;
  const categoryName = displayInfo.categoryInfo?.name || '';
  const seoTitle = categoryName
    ? `${subcategoryName} - ${categoryName}`
    : subcategoryName;
  const seoDescription = t('seo.subcategoryDescription', {
    subcategory: subcategoryName,
    category: categoryName,
    count: displayInfo.count
  }) || `Browse ${displayInfo.count} ads in ${subcategoryName}. Find the best deals on Cambizzle, Cameroon's marketplace.`;

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: t('common.home'), url: '/' },
    ...(categoryName ? [{ name: categoryName, url: `/category/${categoryParam}` }] : []),
    { name: subcategoryName, url: `/subcategory?subcategory=${subcategoryParam}${categoryParam ? `&category=${categoryParam}` : ''}` }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={`/subcategory?subcategory=${subcategoryParam}`}
        keywords={`${subcategoryName}, ${categoryName}, buy, sell, Cameroon, classifieds, Cambizzle`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#D6BA69] hover:text-[#C5A952] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('common.back')}</span>
          </button>
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

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {displayedAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300" />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-4">
                    {/* Previous Button */}
                    {pagination.hasPrevious && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.previousPage || pagination.currentPage - 1)}
                      >
                        ← {t('common.previous')}
                      </Button>
                    )}

                    {/* Page Numbers */}
                    <div className="flex space-x-2">
                      {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else {
                          const current = pagination.currentPage;
                          const total = pagination.totalPages;

                          if (current <= 3) {
                            pageNumber = i + 1;
                          } else if (current >= total - 2) {
                            pageNumber = total - 4 + i;
                          } else {
                            pageNumber = current - 2 + i;
                          }
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={pagination.currentPage === pageNumber ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => goToPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    {pagination.hasNext && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.nextPage || pagination.currentPage + 1)}
                      >
                        {t('common.next')} →
                      </Button>
                    )}
                  </div>
                )}
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
