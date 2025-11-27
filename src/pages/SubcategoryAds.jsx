
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { adsService } from '../services/adsService';
import AdCard from '../components/ads/AdCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FilterSidebar from '../components/filters/FilterSidebar';
import ActiveFilterBadges from '../components/filters/ActiveFilterBadges';
import { buildFilterQueryParams, parseFiltersFromURL, resetFilters, countActiveFilters } from '../utils/filterHelpers';

const SubcategoryAds = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subcategoryAds, setSubcategoryAds] = useState(null);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [creationData, setCreationData] = useState({ categories: [], locations: [] });
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const lastRequestRef = useRef(null);

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');

  // Récupère les données de création pour les filtres
  useEffect(() => {
    async function fetchCreationData() {
      try {
        const data = await adsService.getAdCreationData();
        setCreationData(data);
        console.log('📋 Données de création chargées:', data);
      } catch (e) {
        console.error('Erreur lors du chargement des données de création:', e);
      }
    }
    fetchCreationData();
  }, []);

  // Récupère les filtres disponibles pour la sous-catégorie
  useEffect(() => {
    async function fetchFilters() {
      if (!subcategoryParam) return;
      
      try {
        setFiltersLoading(true);
        console.log('🔧 Récupération des filtres pour:', subcategoryParam);
        const filtersData = await adsService.getFiltersBySubcategory(subcategoryParam);
        setFilters(filtersData || []);
        console.log('✅ Filtres chargés:', filtersData);
      } catch (e) {
        console.error('❌ Erreur lors du chargement des filtres:', e);
        setFilters([]);
      } finally {
        setFiltersLoading(false);
      }
    }
    
    fetchFilters();
  }, [subcategoryParam]);

  // Initialise les filtres sélectionnés depuis l'URL au chargement
  useEffect(() => {
    const filtersFromURL = parseFiltersFromURL(searchParams);
    console.log('🔍 Filtres parsés depuis URL:', filtersFromURL);
    setSelectedFilters(filtersFromURL);
  }, []); // Ne s'exécute qu'une fois au montage

  // Fonction pour récupérer les annonces d'une sous-catégorie
  const fetchSubcategoryAds = async (subcategorySlug, filters = {}) => {
    const requestKey = `subcategory-${subcategorySlug}-${JSON.stringify(filters)}`;
    
    if (lastRequestRef.current === requestKey) {
      console.log('⏭️ Appel sous-catégorie identique ignoré');
      return;
    }
    
    lastRequestRef.current = requestKey;
    
    try {
      console.log('📊 DÉBUT - Récupération des annonces de la sous-catégorie (slug):', subcategorySlug, filters);
      setLoading(true);
      setError(null);
      
      // Construire les query params avec les filtres
      const filterParams = buildFilterQueryParams(filters);
      const allParams = { 
        page: 1, 
        per_page: 20,
        ...filterParams
      };
      
      console.log('🔗 Paramètres de requête:', allParams);
      
      const response = await adsService.getAdsBySubcategory(subcategorySlug, allParams);
      
      console.log('✅ SUCCÈS - Annonces de sous-catégorie chargées:', response.ads?.length || 0, response);
      setSubcategoryAds(response);
    } catch (error) {
      console.error('❌ ERREUR - Lors du chargement des annonces de sous-catégorie:', error);
      setError(error.message);
      setSubcategoryAds(null);
    } finally {
      setLoading(false);
      console.log('🏁 FIN - fetchSubcategoryAds');
    }
  };

  // Gère le changement d'un filtre
  const handleFilterChange = (filterId, value) => {
    console.log('🔄 Changement de filtre:', { filterId, value });
    
    const newSelectedFilters = {
      ...selectedFilters,
      [filterId]: value
    };
    
    // Supprimer le filtre si la valeur est vide
    if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newSelectedFilters[filterId];
    }
    
    setSelectedFilters(newSelectedFilters);
    
    // Mettre à jour l'URL
    updateURLWithFilters(newSelectedFilters);
    
    // Récupérer les annonces avec les nouveaux filtres
    if (subcategoryParam) {
      fetchSubcategoryAds(subcategoryParam, newSelectedFilters);
    }
  };

  // Réinitialise tous les filtres
  const handleResetFilters = () => {
    console.log('🔄 Réinitialisation des filtres');
    const emptyFilters = resetFilters();
    setSelectedFilters(emptyFilters);
    
    // Nettoyer l'URL
    const newParams = new URLSearchParams();
    if (subcategoryParam) newParams.set('subcategory', subcategoryParam);
    if (categoryParam) newParams.set('category', categoryParam);
    setSearchParams(newParams);
    
    // Récupérer les annonces sans filtres
    if (subcategoryParam) {
      fetchSubcategoryAds(subcategoryParam, emptyFilters);
    }
  };

  // Supprime un filtre individuel
  const handleRemoveFilter = (filterId) => {
    console.log('🗑️ Suppression du filtre:', filterId);
    const newSelectedFilters = { ...selectedFilters };
    delete newSelectedFilters[filterId];
    setSelectedFilters(newSelectedFilters);
    
    // Mettre à jour l'URL
    updateURLWithFilters(newSelectedFilters);
    
    // Récupérer les annonces
    if (subcategoryParam) {
      fetchSubcategoryAds(subcategoryParam, newSelectedFilters);
    }
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

  useEffect(() => {
    console.log('🔄 useEffect SubcategoryAds déclenché');
    
    if (!subcategoryParam) {
      console.log('❌ Pas de paramètre subcategory');
      setError('Subcategory parameter is required');
      return;
    }

    console.log('🎯 Appel direct avec slug subcategory:', subcategoryParam);
    console.log('🔍 Filtres sélectionnés:', selectedFilters);
    
    // APPEL DIRECT AVEC LE SLUG ET LES FILTRES
    console.log('🚀 Appel API avec slug:', subcategoryParam, selectedFilters);
    fetchSubcategoryAds(subcategoryParam, selectedFilters);
  }, [subcategoryParam]); // Ne recharger que si la sous-catégorie change, pas les filtres

  // Fonction de tri côté frontend
  const sortAds = (adsArray, sortBy) => {
    if (!adsArray || adsArray.length === 0) return adsArray;
    
    const sortedAds = [...adsArray];
    
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
  };

  const rawAds = subcategoryAds?.ads || [];
  const displayedAds = sortAds(rawAds, sortBy);

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
            {displayInfo.title}
          </h1>
          <p className="text-gray-600">
            {displayInfo.count} ad{displayInfo.count > 1 ? 's' : ''} found
          </p>
          
          {/* Debug info */}
          {displayInfo.subcategoryInfo && (
            <div className="mt-2 text-sm text-gray-500 bg-green-50 p-2 rounded">
              📊 Subcategory: {displayInfo.subcategoryInfo.name} (ID: {displayInfo.subcategoryInfo.id}, Slug: {displayInfo.subcategoryInfo.slug})
              {displayInfo.categoryInfo && (
                <span className="block text-gray-400">in Category: {displayInfo.categoryInfo.name}</span>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              ❌ Error: {error}
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
                <span>Filters</span>
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
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                  >
                    <option value="recent">Most recent</option>
                    <option value="price-asc">Price ascending</option>
                    <option value="price-desc">Price descending</option>
                    <option value="popular">Most popular</option>
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
                    Error loading ads
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error}
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => window.location.reload()}
                  >
                    Try again
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
                    No ads found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {countActiveFilters(selectedFilters) > 0 
                      ? 'No ads match your selected filters. Try adjusting your criteria.'
                      : 'There are no ads in this subcategory yet.'}
                  </p>
                  {countActiveFilters(selectedFilters) > 0 && (
                    <Button
                      variant="primary"
                      onClick={handleResetFilters}
                    >
                      Reset Filters
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
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white overflow-y-auto">
            <FilterSidebar
              filters={filters}
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
