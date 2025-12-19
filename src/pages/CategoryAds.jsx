import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import AdCard from '../components/ads/AdCard';
import Button from '../components/ui/Button';
import { useAdsByCategory } from '../hooks/useAdsQuery';

const CategoryAds = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const page = parseInt(searchParams.get('page') || '1', 10);

  // Utilisation du hook React Query
  const { data, isLoading, error, refetch } = useAdsByCategory(categoryId, { page });

  const ads = data?.ads || [];
  const categoryInfo = data?.category || null;
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrevious: false
  };

  const sortOptions = [
    { value: 'recent', label: 'Most recent' },
    { value: 'price-asc', label: 'Price ascending' },
    { value: 'price-desc', label: 'Price descending' },
    { value: 'popular', label: 'Most popular' }
  ];

  // Tri des annonces avec useMemo pour éviter les recalculs inutiles
  const displayedAds = useMemo(() => {
    if (!ads || ads.length === 0) return [];

    const sortedAds = [...ads];

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
  }, [ads, sortBy]);

  const goToPage = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNumber);
    setSearchParams(newParams);
  };

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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D6BA69] focus:border-[#D6BA69] cursor-pointer"
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
              {error.message || 'Failed to load ads for this category.'}
            </p>
            <Button
              variant="primary"
              onClick={() => refetch()}
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
                    onClick={() => goToPage(pagination.previousPage || pagination.currentPage - 1)}
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
