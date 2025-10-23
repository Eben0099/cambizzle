import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAds } from '../contexts/AdsContext';
import AdCard from '../components/ads/AdCard';

const CategoryAds = () => {
  const { category } = useParams();
  const location = useLocation();
  const { ads } = useAds();

  // Get category from query string if not in params
  const searchParams = new URLSearchParams(location.search);
  const categorySlug = category || searchParams.get('category');

  // Filter ads by category
  const filteredAds = ads.filter(ad => ad.categorySlug === categorySlug);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">Ads for category: {categorySlug}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAds.length > 0 ? (
          filteredAds.map(ad => <AdCard key={ad.id} ad={ad} />)
        ) : (
          <div className="col-span-full text-center text-gray-500">No ads found for this category.</div>
        )}
      </div>
    </div>
  );
};

export default CategoryAds;
