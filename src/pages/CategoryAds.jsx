
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import AdCard from '../components/ads/AdCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { adsService } from '../services/adsService';

const CategoryAds = () => {
  const { categoryId } = useParams(); // Changé de 'category' à 'categoryId'
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const sortOptions = [
    { value: 'recent', label: 'Most recent' },
    { value: 'price-asc', label: 'Price ascending' },
    { value: 'price-desc', label: 'Price descending' },
    { value: 'popular', label: 'Most popular' }
  ];

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

  useEffect(() => {
    async function fetchCategoryAds() {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 Fetching category ads for category:', categoryId);
        const page = searchParams.get('page') || 1;
        const response = await adsService.getAdsByCategory(categoryId, { page });
        
        console.log('📦 Category ads response:', response);
        
        // Gestion du format de réponse API
        const adsData = response.ads || [];
        const categoryData = response.category || null;
        const paginationData = response.pagination || { 
          currentPage: 1, 
          totalPages: 1, 
          total: 0,
          hasNext: false,
          hasPrevious: false
        };

        setAds(adsData);
        setCategoryInfo(categoryData);
        setPagination(paginationData);
        
        console.log('✅ Category ads loaded:', {
          adsCount: adsData.length,
          category: categoryData?.name,
          pagination: paginationData
        });
        
      } catch (e) {
        console.error('❌ Error fetching category ads:', e);
        setError(e.message || 'Failed to load ads for this category.');
      } finally {
        setLoading(false);
      }
    }
    
    if (categoryId) {
      fetchCategoryAds();
    }
  }, [categoryId, searchParams]);

  const displayedAds = sortAds(ads, sortBy);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryInfo ? categoryInfo.name : 'Category Ads'}
          </h1>
          <p className="text-gray-600">
            {pagination.total} ad{pagination.total > 1 ? 's' : ''} found
          </p>
          {categoryInfo && (
            <div className="mt-2 text-sm text-gray-500">
              Category ID: {categoryInfo.id} | Slug: {categoryInfo.slug}
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
            </Button>

            <div className="relative">
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
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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
              <div className="flex justify-center items-center mt-12 space-x-4">
                {/* Previous Button */}
                {pagination.hasPrevious && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', pagination.previousPage || pagination.currentPage - 1);
                      setSearchParams(newParams);
                    }}
                  >
                    ← Previous
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
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', pageNumber);
                          setSearchParams(newParams);
                        }}
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
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', pagination.nextPage || pagination.currentPage + 1);
                      setSearchParams(newParams);
                    }}
                  >
                    Next →
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ads found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no ads in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAds;
