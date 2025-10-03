import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal, MapPin, Euro, ArrowLeft, Tag } from 'lucide-react';
import { useAds } from '../contexts/AdsContext';
import { CATEGORIES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AdCard from '../components/ads/AdCard';

const Subcategory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
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
    searchResults,
    isLoading,
    searchAds,
    fetchAds,
    setFilters,
    pagination
  } = useAds();

  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');

  // Trouver les informations de la catégorie et sous-catégorie
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories?.find(sub => sub.id === subcategoryId);

  useEffect(() => {
    const filters = {
      category: searchParams.get('category'),
      subcategory: searchParams.get('subcategory'),
      priceMin: searchParams.get('priceMin'),
      priceMax: searchParams.get('priceMax'),
      location: searchParams.get('location'),
      type: searchParams.get('type'),
      condition: searchParams.get('condition')
    };

    // Remove null values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null)
    );

    if (query) {
      searchAds(query, cleanFilters);
    } else {
      fetchAds(1, cleanFilters);
    }
  }, [searchParams]);

  const handleFilterChange = (name, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
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

    const newSearchParams = new URLSearchParams();
    if (query) {
      newSearchParams.set('q', query);
    }
    setSearchParams(newSearchParams);
  };

  const sortOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'popular', label: 'Plus populaire' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'Neuf' },
    { value: 'like_new', label: 'Comme neuf' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'État correct' },
    { value: 'poor', label: 'À rénover' }
  ];

  const typeOptions = [
    { value: 'sell', label: 'Vente' },
    { value: 'rent', label: 'Location' },
    { value: 'service', label: 'Service' }
  ];

  const ads = query ? searchResults : searchResults;
  const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/search')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux annonces</span>
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <span>Accueil</span>
            <span>/</span>
            <span className="text-[#D6BA69] cursor-pointer hover:underline" onClick={() => navigate('/search')}>
              Annonces
            </span>
            <span>/</span>
            <span className="text-[#D6BA69] cursor-pointer hover:underline" onClick={() => navigate(`/search?category=${categoryId}`)}>
              {category?.name}
            </span>
            <span>/</span>
            <span className="font-medium text-gray-900">{subcategory?.name}</span>
          </div>

          {/* Titre principal */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#D6BA69] rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {subcategory?.name}
              </h1>
              <p className="text-gray-600">
                Découvrez toutes les annonces dans cette catégorie
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{pagination.totalItems}</span>
              <span>annonce{pagination.totalItems > 1 ? 's' : ''} trouvée{pagination.totalItems > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{subcategory?.count || 0}</span>
              <span>dans cette sous-catégorie</span>
            </div>
          </div>
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
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                  Type
                </label>
                <select
                  value={localFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                >
                  <option value="">Tous les types</option>
                  {typeOptions.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
                <select
                  value={localFilters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69]"
                >
                  <option value="">Tous les états</option>
                  {conditionOptions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix minimum
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
                  Prix maximum
                </label>
                <Input
                  type="number"
                  placeholder="Illimité"
                  value={localFilters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <Input
                  type="text"
                  placeholder="Ville, code postal..."
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={clearFilters}>
                Effacer
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Appliquer les filtres
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : ads.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {ads.map((ad) => (
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
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Il n'y a pas encore d'annonces dans cette sous-catégorie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={() => navigate('/create-ad')}>
                Créer la première annonce
              </Button>
              <Button variant="ghost" onClick={() => navigate('/search')}>
                Voir toutes les annonces
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subcategory;
