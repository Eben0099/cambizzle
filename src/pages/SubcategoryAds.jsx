
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { adsService } from '../services/adsService';
import AdCard from '../components/ads/AdCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const SubcategoryAds = () => {
  const [searchParams] = useSearchParams();
  const [subcategoryAds, setSubcategoryAds] = useState(null);
  const [creationData, setCreationData] = useState({ categories: [], locations: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
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
      
      const response = await adsService.getAdsBySubcategory(subcategorySlug, { page: 1, ...filters });
      
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

  useEffect(() => {
    console.log('🔄 useEffect SubcategoryAds déclenché');
    
    if (!subcategoryParam) {
      console.log('❌ Pas de paramètre subcategory');
      setError('Subcategory parameter is required');
      return;
    }

    console.log('🎯 Appel direct avec slug subcategory:', subcategoryParam);
    
    // Construire les filtres
    const filters = {
      priceMin: searchParams.get('priceMin'),
      priceMax: searchParams.get('priceMax'),
      location: searchParams.get('location'),
      sort: searchParams.get('sort') || 'recent'
    };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null)
    );

    // APPEL DIRECT AVEC LE SLUG
    console.log('🚀 Appel API avec slug:', subcategoryParam, cleanFilters);
    fetchSubcategoryAds(subcategoryParam, cleanFilters);
  }, [searchParams, subcategoryParam]);

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
        <div className="mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
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
              <p className="text-gray-600">
                There are no ads in this subcategory yet.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubcategoryAds;
