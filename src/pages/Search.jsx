import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal, MapPin, Euro } from 'lucide-react';
import { useAds } from '../contexts/AdsContext';
import { adsService } from '../services/adsService';
// import { CATEGORIES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AdCard from '../components/ads/AdCard';

const Search = () => {
  const [creationData, setCreationData] = useState({ categories: [], locations: [] });
  const [categoryAds, setCategoryAds] = useState(null); // Ajout pour gérer les annonces de catégorie
  const [subcategoryAds, setSubcategoryAds] = useState(null); // Ajout pour gérer les annonces de sous-catégorie
  const [categoryLoading, setCategoryLoading] = useState(false); // Loading spécifique pour les catégories
  const [subcategoryLoading, setSubcategoryLoading] = useState(false); // Loading spécifique pour les sous-catégories
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const lastRequestRef = useRef(null); // Pour éviter les requêtes multiples
  const categoryRequestRef = useRef(null); // Pour éviter les requêtes catégories multiples
  const subcategoryRequestRef = useRef(null); // Pour éviter les requêtes sous-catégories multiples
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    condition: searchParams.get('condition') || ''
  });

  const { 
    ads, 
    searchResults, 
    isLoading, 
    searchAds, 
    fetchAds, 
    setFilters,
    pagination 
  } = useAds();

  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  // Récupère les données de création pour les filtres
  useEffect(() => {
    async function fetchCreationData() {
      try {
        const data = await adsService.getAdCreationData();
        setCreationData(data);
      } catch (e) {
        console.error('Erreur lors du chargement des données de création:', e);
        // fallback: pas de données
      }
    }
    fetchCreationData();
  }, []);

  // Fonction pour récupérer les annonces d'une catégorie spécifique
  const fetchCategoryAds = async (categoryId, filters = {}) => {
    const requestKey = `category-${categoryId}-${JSON.stringify(filters)}`;
    
    // Éviter les appels multiples pour la même catégorie
    if (categoryRequestRef.current === requestKey) {
      console.log('⏭️ Appel catégorie identique ignoré');
      return;
    }
    
    categoryRequestRef.current = requestKey;
    
    try {
      console.log('📊 DÉBUT - Récupération des annonces de la catégorie:', categoryId, filters);
      setCategoryLoading(true);
      
      const response = await adsService.getAdsByCategory(categoryId, { page: 1, ...filters });
      
      console.log('✅ SUCCÈS - Annonces de catégorie chargées:', response.ads?.length || 0, response);
      setCategoryAds(response);
    } catch (error) {
      console.error('❌ ERREUR - Lors du chargement des annonces de catégorie:', error);
      setCategoryAds(null);
    } finally {
      setCategoryLoading(false);
      console.log('🏁 FIN - fetchCategoryAds');
    }
  };

  // Fonction pour récupérer les annonces d'une sous-catégorie spécifique
  const fetchSubcategoryAds = async (subcategorySlug, filters = {}) => {
    const requestKey = `subcategory-${subcategorySlug}-${JSON.stringify(filters)}`;
    
    // Éviter les appels multiples pour la même sous-catégorie
    if (subcategoryRequestRef.current === requestKey) {
      console.log('⏭️ Appel sous-catégorie identique ignoré');
      return;
    }
    
    subcategoryRequestRef.current = requestKey;
    
    try {
      console.log('📊 DÉBUT - Récupération des annonces de la sous-catégorie (slug):', subcategorySlug, filters);
      setSubcategoryLoading(true);
      
      const response = await adsService.getAdsBySubcategory(subcategorySlug, { page: 1, ...filters });
      
      console.log('✅ SUCCÈS - Annonces de sous-catégorie chargées:', response.ads?.length || 0, response);
      setSubcategoryAds(response);
    } catch (error) {
      console.error('❌ ERREUR - Lors du chargement des annonces de sous-catégorie:', error);
      setSubcategoryAds(null);
    } finally {
      setSubcategoryLoading(false);
      console.log('🏁 FIN - fetchSubcategoryAds');
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect Search déclenché');
    
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const sortParam = searchParams.get('sort') || 'recent';
    
    // Créer une clé unique pour éviter les doublons
    const requestKey = `${categoryParam}|${subcategoryParam}|${query}|${sortParam}|${creationData.categories?.length || 0}`;
    
    console.log('🔑 Clé de requête:', requestKey);
    console.log('🔑 Dernière clé:', lastRequestRef.current);
    
    if (lastRequestRef.current === requestKey) {
      console.log('⏭️ Requête identique ignorée');
      return;
    }
    
    lastRequestRef.current = requestKey;
    setSortBy(sortParam);

    // Attendre que les données de création soient chargées
    if (!creationData.categories || creationData.categories.length === 0) {
      console.log('⏳ Attente des données de création...');
      return;
    }

    // PRIORITÉ 1: SOUS-CATÉGORIE (plus spécifique)
    if (subcategoryParam) {
      console.log('🎯 Mode Sous-catégorie détecté:', subcategoryParam);
      
      // Reset les autres états
      setCategoryAds(null);
      
      // Construire les filtres pour la sous-catégorie
      const subcategoryFilters = {
        priceMin: searchParams.get('priceMin'),
        priceMax: searchParams.get('priceMax'),
        location: searchParams.get('location'),
        sort: sortParam
      };
      
      const cleanSubcategoryFilters = Object.fromEntries(
        Object.entries(subcategoryFilters).filter(([_, value]) => value !== null)
      );

      // APPEL DIRECT AVEC LE SLUG - Plus besoin de chercher l'ID
      console.log('🚀 Appel direct avec slug:', subcategoryParam);
      fetchSubcategoryAds(subcategoryParam, cleanSubcategoryFilters);
      return; // Arrêter ici
    } else {
      // Reset subcategoryAds si on n'est pas en mode sous-catégorie
      setSubcategoryAds(null);
    }

    // PRIORITÉ 2: CATÉGORIE
    if (categoryParam) {
      console.log('🎯 Mode Catégorie détecté:', categoryParam);
      
      // Attendre que les données de création soient chargées pour trouver l'ID
      if (!creationData.categories || creationData.categories.length === 0) {
        console.log('⏳ Attente des données de création pour les catégories...');
        return;
      }

      // Trouver l'ID de la catégorie par slug ou nom
      const foundCategory = creationData.categories.find(cat => 
        cat.slug === categoryParam || 
        cat.name.toLowerCase() === categoryParam.toLowerCase() ||
        cat.id.toString() === categoryParam
      );

      if (foundCategory) {
        console.log('✅ Catégorie trouvée, appel direct à l\'API:', foundCategory);
        
        // Reset les autres états
        setSubcategoryAds(null);
        
        // Construire les filtres pour la catégorie (sans category car on utilise l'ID)
        const categoryFilters = {
          priceMin: searchParams.get('priceMin'),
          priceMax: searchParams.get('priceMax'),
          location: searchParams.get('location'),
          sort: sortParam
        };
        
        const cleanCategoryFilters = Object.fromEntries(
          Object.entries(categoryFilters).filter(([_, value]) => value !== null)
        );

        // APPEL DIRECT À L'API CATÉGORIE
        fetchCategoryAds(foundCategory.id, cleanCategoryFilters);
        return; // Arrêter ici, ne pas utiliser le contexte Search
      } else {
        console.log('❌ Catégorie non trouvée:', categoryParam);
        console.log('Catégories disponibles:', creationData.categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
        setCategoryAds(null);
        return;
      }
    }

    // LOGIC NORMALE POUR SEARCH ET ANNONCES GÉNÉRALES (sans catégorie ni sous-catégorie)
    console.log('🔍 Mode Search normal');
    setCategoryAds(null); // Reset categoryAds si on n'est pas en mode catégorie
    setSubcategoryAds(null); // Reset subcategoryAds si on n'est pas en mode sous-catégorie
    
    const generalFilters = {
      subcategory: subcategoryParam,
      priceMin: searchParams.get('priceMin'),
      priceMax: searchParams.get('priceMax'),
      location: searchParams.get('location'),
      type: searchParams.get('type'),
      condition: searchParams.get('condition'),
      sort: sortParam
    };

    const cleanGeneralFilters = Object.fromEntries(
      Object.entries(generalFilters).filter(([_, value]) => value !== null)
    );

    console.log('🔍 Mode Search normal avec filtres:', cleanGeneralFilters);

    if (query) {
      console.log('📝 Recherche avec query:', query);
      searchAds(query, cleanGeneralFilters);
    } else {
      console.log('📋 Récupération de toutes les annonces');
      fetchAds(1, cleanGeneralFilters);
    }
  }, [searchParams, query, creationData.categories]); // RETIRÉ fetchAds et searchAds des dépendances // Simplifié les dépendances

  // Rend les filtres interactifs : chaque changement déclenche la recherche
  const handleFilterChange = (name, value) => {
    const updatedFilters = {
      ...localFilters,
      [name]: value
    };
    setLocalFilters(updatedFilters);
    // Met à jour les paramètres de recherche dans l'URL
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(updatedFilters).forEach(([key, val]) => {
      if (val) {
        newSearchParams.set(key, val);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
  };

  // Gère le changement de tri
  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
    const newSearchParams = new URLSearchParams(searchParams);
    if (sortValue) {
      newSearchParams.set('sort', sortValue);
    } else {
      newSearchParams.delete('sort');
    }
    setSearchParams(newSearchParams);
  };

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(localFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    setSearchParams(newSearchParams);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setLocalFilters({
      category: '',
      subcategory: '',
      priceMin: '',
      priceMax: '',
      location: '',
      type: '',
      condition: ''
    });
    setSortBy('recent'); // Reset du tri aussi

    const newSearchParams = new URLSearchParams();
    if (query) {
      newSearchParams.set('q', query);
    }
    setSearchParams(newSearchParams);
  };

  const sortOptions = [
    { value: 'recent', label: 'Most recent' },
    { value: 'price-asc', label: 'Price ascending' },
    { value: 'price-desc', label: 'Price descending' },
    { value: 'popular', label: 'Most popular' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like new' },
    { value: 'good', label: 'Good condition' },
    { value: 'fair', label: 'Fair condition' },
    { value: 'poor', label: 'Needs renovation' }
  ];

  const typeOptions = [
    { value: 'sell', label: 'Sale' },
    { value: 'rent', label: 'Rent' },
    { value: 'service', label: 'Service' }
  ];

  // Fonction de tri côté frontend (nouveau format API)
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

  // GESTION DES DONNÉES INDÉPENDANTE
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  
  let rawAds, displayInfo, currentLoading;

  // PRIORITÉ 1: SOUS-CATÉGORIE (plus spécifique)
  if (subcategoryParam && subcategoryAds) {
    // MODE SOUS-CATÉGORIE INDÉPENDANT - DONNÉES CHARGÉES
    rawAds = subcategoryAds.ads || [];
    currentLoading = subcategoryLoading;
    displayInfo = {
      title: subcategoryAds.subcategory?.name || `Ads in "${subcategoryParam}"`,
      count: subcategoryAds.pagination?.total || rawAds.length,
      type: 'subcategory',
      subcategoryInfo: subcategoryAds.subcategory,
      categoryInfo: subcategoryAds.category
    };
    console.log('📊 Mode Sous-catégorie - Affichage:', displayInfo);
  } else if (subcategoryParam) {
    // MODE SOUS-CATÉGORIE - CHARGEMENT OU PAS ENCORE DE DONNÉES
    rawAds = [];
    currentLoading = subcategoryLoading || !creationData.categories.length;
    displayInfo = {
      title: subcategoryLoading ? `Loading ads in "${subcategoryParam}"...` : `Looking for "${subcategoryParam}"...`,
      count: 0,
      type: 'subcategory-loading'
    };
    console.log('⏳ Mode Sous-catégorie - Chargement');
  } 
  // PRIORITÉ 2: CATÉGORIE
  else if (categoryParam && categoryAds) {
    // MODE CATÉGORIE INDÉPENDANT - DONNÉES CHARGÉES
    rawAds = categoryAds.ads || [];
    currentLoading = categoryLoading; // Utiliser notre loading spécifique
    displayInfo = {
      title: categoryAds.category?.name || `Ads in "${categoryParam}"`,
      count: categoryAds.pagination?.total || rawAds.length,
      type: 'category',
      categoryInfo: categoryAds.category
    };
    console.log('📊 Mode Catégorie - Affichage:', displayInfo);
  } else if (categoryParam) {
    // MODE CATÉGORIE - CHARGEMENT OU PAS ENCORE DE DONNÉES
    rawAds = [];
    currentLoading = categoryLoading || !creationData.categories.length; // Loading si on charge les catégories ou les données
    displayInfo = {
      title: categoryLoading ? `Loading ads in "${categoryParam}"...` : `Looking for "${categoryParam}"...`,
      count: 0,
      type: 'category-loading'
    };
    console.log('⏳ Mode Catégorie - Chargement');
  } else {
    // MODE SEARCH/GÉNÉRAL NORMAL
    rawAds = query ? searchResults : ads;
    currentLoading = isLoading;
    displayInfo = {
      title: subcategoryParam
        ? `Ads in "${subcategoryParam}"`
        : query
          ? `Results for "${query}"`
          : 'All Ads',
      count: rawAds?.length || 0,
      type: subcategoryParam ? 'subcategory' : (query ? 'search' : 'all')
    };
  }

  const displayedAds = sortAds(rawAds, sortBy);
  const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {displayInfo.title}
          </h1>
          <p className="text-gray-600">
            {displayInfo.count} ad{displayInfo.count > 1 ? 's' : ''} found
          </p>
          
          {/* Debug info pour mode catégorie */}
          {displayInfo.type === 'category' && displayInfo.categoryInfo && (
            <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-2 rounded">
              📊 Category Mode: {displayInfo.categoryInfo.name} (ID: {displayInfo.categoryInfo.id}, Slug: {displayInfo.categoryInfo.slug})
            </div>
          )}
          
          {/* Debug info pour mode sous-catégorie */}
          {displayInfo.type === 'subcategory' && displayInfo.subcategoryInfo && (
            <div className="mt-2 text-sm text-gray-500 bg-green-50 p-2 rounded">
              📊 Subcategory Mode: {displayInfo.subcategoryInfo.name} (ID: {displayInfo.subcategoryInfo.id}, Slug: {displayInfo.subcategoryInfo.slug})
              {displayInfo.categoryInfo && (
                <span className="block text-gray-400">in Category: {displayInfo.categoryInfo.name}</span>
              )}
            </div>
          )}
          
          {displayInfo.type === 'subcategory-loading' && (
            <div className="mt-2 text-sm text-gray-500 bg-yellow-50 p-2 rounded">
              ⏳ Loading subcategory data...
            </div>
          )}
          
          {displayInfo.type === 'category-loading' && (
            <div className="mt-2 text-sm text-gray-500 bg-yellow-50 p-2 rounded">
              ⏳ Loading category data...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {sortBy !== 'recent' && (
                <span className="absolute -top-1 -right-1 bg-[#D6BA69] text-black rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                  ↕
                </span>
              )}
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

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                >
                  <option value="">All categories</option>
                  {creationData.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={localFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                >
                  <option value="">All types</option>
                  {typeOptions.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={localFilters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                >
                  <option value="">All conditions</option>
                  {conditionOptions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum price
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum price
                </label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={localFilters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                >
                  <option value="">All locations</option>
                  {creationData.locations.map(loc => (
                    <option key={loc.id} value={loc.city}>
                      {loc.city} ({loc.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Apply filters
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {currentLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : displayedAds.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {displayedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={pagination.currentPage === i + 1 ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        // Handle pagination
                      }}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ads found
            </h3>
            <p className="text-gray-600 mb-6">
              Try modifying your search criteria or remove some filters.
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
