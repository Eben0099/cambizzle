import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal, MapPin, DollarSign } from 'lucide-react';
import { useAds } from '../contexts/AdsContext';
import { adsService } from '../services/adsService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import AdCard from '../components/ads/AdCard';
import Loader from '../components/ui/Loader';
import SEO from '../components/SEO';
import { SearchResultsSchema } from '../components/StructuredData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Search = () => {
  const [creationData, setCreationData] = useState({ categories: [], locations: [] });
  const [categoryAds, setCategoryAds] = useState(null);
  const [subcategoryAds, setSubcategoryAds] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [keywordFilter, setKeywordFilter] = useState('');
  const lastRequestRef = useRef(null);
  const categoryRequestRef = useRef(null);
  const subcategoryRequestRef = useRef(null);
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || 'all',
    subcategory: searchParams.get('subcategory') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    location: searchParams.get('location') || 'all',
    type: searchParams.get('type') || 'all',
    condition: searchParams.get('condition') || 'all'
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

  // Fetch creation data for filters
  useEffect(() => {
    async function fetchCreationData() {
      try {
        const data = await adsService.getAdCreationData();
        setCreationData(data);
      } catch (e) {
        console.error('Error loading creation data:', e);
      }
    }
    fetchCreationData();
  }, []);

  // Function to fetch ads for a specific category
  const fetchCategoryAds = async (categoryId, filters = {}) => {
    const requestKey = `category-${categoryId}-${JSON.stringify(filters)}`;
    
    if (categoryRequestRef.current === requestKey) {
      return;
    }
    
    categoryRequestRef.current = requestKey;
    
    try {
      setCategoryLoading(true);
      const response = await adsService.getAdsByCategory(categoryId, { page: 1, ...filters });
      setCategoryAds(response);
    } catch (error) {
      console.error('Error loading category ads:', error);
      setCategoryAds(null);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Function to fetch ads for a specific subcategory
  const fetchSubcategoryAds = async (subcategorySlug, filters = {}) => {
    const requestKey = `subcategory-${subcategorySlug}-${JSON.stringify(filters)}`;
    
    if (subcategoryRequestRef.current === requestKey) {
      return;
    }
    
    subcategoryRequestRef.current = requestKey;
    
    try {
      setSubcategoryLoading(true);
      const response = await adsService.getAdsBySubcategory(subcategorySlug, { page: 1, ...filters });
      setSubcategoryAds(response);
    } catch (error) {
      console.error('Error loading subcategory ads:', error);
      setSubcategoryAds(null);
    } finally {
      setSubcategoryLoading(false);
    }
  };

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const sortParam = searchParams.get('sort') || 'recent';
    
    const requestKey = `${categoryParam}|${subcategoryParam}|${query}|${sortParam}|${creationData.categories?.length || 0}`;
    
    if (lastRequestRef.current === requestKey) {
      return;
    }
    
    lastRequestRef.current = requestKey;
    setSortBy(sortParam);

    if (!creationData.categories || creationData.categories.length === 0) {
      return;
    }

    if (subcategoryParam) {
      setCategoryAds(null);
      const subcategoryFilters = {
        priceMin: searchParams.get('priceMin'),
        priceMax: searchParams.get('priceMax'),
        location: searchParams.get('location'),
        sort: sortParam
      };
      const cleanSubcategoryFilters = Object.fromEntries(
        Object.entries(subcategoryFilters).filter(([_, value]) => value !== null)
      );
      fetchSubcategoryAds(subcategoryParam, cleanSubcategoryFilters);
      return;
    } else {
      setSubcategoryAds(null);
    }

    if (categoryParam) {
      const foundCategory = creationData.categories.find(cat => 
        cat.slug === categoryParam || 
        cat.name.toLowerCase() === categoryParam.toLowerCase() ||
        cat.id.toString() === categoryParam
      );

      if (foundCategory) {
        setSubcategoryAds(null);
        const categoryFilters = {
          priceMin: searchParams.get('priceMin'),
          priceMax: searchParams.get('priceMax'),
          location: searchParams.get('location'),
          sort: sortParam
        };
        const cleanCategoryFilters = Object.fromEntries(
          Object.entries(categoryFilters).filter(([_, value]) => value !== null)
        );
        fetchCategoryAds(foundCategory.id, cleanCategoryFilters);
        return;
      } else {
        setCategoryAds(null);
        return;
      }
    }

    setCategoryAds(null);
    setSubcategoryAds(null);
    
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

    if (query) {
      searchAds(query, cleanGeneralFilters);
    } else {
      fetchAds(1, cleanGeneralFilters);
    }
  }, [searchParams, query, creationData.categories]);

  // Make filters interactive: each change triggers the search
  const handleFilterChange = (name, value) => {
    const updatedFilters = {
      ...localFilters,
      [name]: value
    };
    setLocalFilters(updatedFilters);
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(updatedFilters).forEach(([key, val]) => {
      // Treat "all" as empty/cleared filter
      if (val && val !== "all") {
        newSearchParams.set(key, val);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
  };

  // Handle sort change
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
    setSortBy('recent');

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

  // Frontend sorting function (new API format)
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

  // INDEPENDENT DATA MANAGEMENT
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  
  let rawAds, displayInfo, currentLoading;

  if (subcategoryParam && subcategoryAds) {
    rawAds = subcategoryAds.ads || [];
    currentLoading = subcategoryLoading;
    displayInfo = {
      title: subcategoryAds.subcategory?.name || `Ads in "${subcategoryParam}"`,
      count: subcategoryAds.pagination?.total || rawAds.length,
      type: 'subcategory',
      subcategoryInfo: subcategoryAds.subcategory,
      categoryInfo: subcategoryAds.category
    };
  } else if (subcategoryParam) {
    rawAds = [];
    currentLoading = subcategoryLoading || !creationData.categories.length;
    displayInfo = {
      title: subcategoryLoading ? `Loading ads in "${subcategoryParam}"...` : `Looking for "${subcategoryParam}"...`,
      count: 0,
      type: 'subcategory-loading'
    };
  } else if (categoryParam && categoryAds) {
    rawAds = categoryAds.ads || [];
    currentLoading = categoryLoading;
    displayInfo = {
      title: categoryAds.category?.name || `Ads in "${categoryParam}"`,
      count: categoryAds.pagination?.total || rawAds.length,
      type: 'category',
      categoryInfo: categoryAds.category
    };
  } else if (categoryParam) {
    rawAds = [];
    currentLoading = categoryLoading || !creationData.categories.length;
    displayInfo = {
      title: categoryLoading ? `Loading ads in "${categoryParam}"...` : `Looking for "${categoryParam}"...`,
      count: 0,
      type: 'category-loading'
    };
  } else {
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

  // Fonction de filtrage par mots-clés (frontend)
  const filterByKeywords = (adsArray) => {
    if (!keywordFilter.trim()) return adsArray;
    
    const keywords = keywordFilter.toLowerCase().trim().split(/\s+/);
    
    return adsArray.filter(ad => {
      const searchableText = [
        ad.title,
        ad.description,
        ad.subcategory?.name,
        ad.category?.name,
        ad.location,
        ad.brand?.name
      ].filter(Boolean).join(' ').toLowerCase();
      
      return keywords.every(keyword => searchableText.includes(keyword));
    });
  };

  const filteredAds = filterByKeywords(rawAds);
  const displayedAds = sortAds(filteredAds, sortBy);
  const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

  const searchTitle = query ? `Search results for "${query}"` : 
                      subcategoryParam ? `${subcategoryParam} ads` :
                      categoryParam ? `${categoryParam} ads` :
                      'All ads';
  
  const searchDescription = `Browse ${displayedAds.length} classified ads in Cameroon. ${query ? `Find ${query}` : 'Buy and sell items'} on Cambizzle.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${searchTitle} | Cambizzle`}
        description={searchDescription}
        url={window.location.pathname + window.location.search}
        keywords={`${query || ''}, ${categoryParam || ''}, ${subcategoryParam || ''}, classifieds, Cameroon, buy, sell`}
      />
      {query && <SearchResultsSchema query={query} numberOfResults={displayedAds.length} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {displayInfo.title}
          </h1>
          <p className="text-gray-600">
            {keywordFilter ? filteredAds.length : displayInfo.count} ad{(keywordFilter ? filteredAds.length : displayInfo.count) !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Keyword Search */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Filter results by keywords (title, description, brand, location...)..."
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              className="w-full pl-10 pr-10 h-12 text-base"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {keywordFilter && (
              <button
                onClick={() => setKeywordFilter('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {keywordFilter && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {filteredAds.length} of {rawAds.length} ads matching "{keywordFilter}"
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-start sm:justify-end">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 p-6 bg-white shadow-sm rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={localFilters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {creationData.categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={localFilters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {typeOptions.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={localFilters.condition}
                  onValueChange={(value) => handleFilterChange('condition', value)}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="All conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All conditions</SelectItem>
                    {conditionOptions.map(condition => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceMin">Minimum price</Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="0"
                  value={localFilters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceMax">Maximum price</Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="Unlimited"
                  value={localFilters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={localFilters.location}
                  onValueChange={(value) => handleFilterChange('location', value)}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {creationData.locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.city}>
                        {loc.city} ({loc.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
              <Button onClick={applyFilters}>
                Apply filters
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {currentLoading ? (
          <Loader text="Loading ads..." />
        ) : displayedAds.length > 0 ? (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {displayedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-4 py-2 border border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle prev page
                    }}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle next page
                    }}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No ads found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria or removing some filters to see more results.
            </p>
            <Button onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;