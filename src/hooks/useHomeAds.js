import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adsService } from '../services/adsService';

const useHomeAds = (initialPage = 1, perPage = 8, search = '') => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [search]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['ads', 'home', currentPage, perPage, search],
    queryFn: async () => {
      const response = await adsService.getAdsFromAPI(currentPage, perPage, search);

      // Handle case where response.ads is undefined or null
      if (!response?.ads) {
        return {
          ads: [],
          pagination: response?.pagination || null
        };
      }

      // Conversion snake_case vers camelCase pour cohérence
      const processedAds = response.ads.map(ad => ({
        id: ad.id,
        userId: ad.userId || ad.user_id,
        locationId: ad.locationId || ad.location_id,
        subcategoryId: ad.subcategoryId || ad.subcategory_id,
        brandId: ad.brandId || ad.brand_id,
        slug: ad.slug,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        originalPrice: ad.originalPrice || ad.original_price,
        discountPercentage: ad.discountPercentage || ad.discount_percentage,
        hasDiscount: ad.hasDiscount || ad.has_discount,
        isNegotiable: ad.isNegotiable || ad.is_negotiable,
        isBoosted: ad.isBoosted || ad.is_boosted,
        referralCode: ad.referralCode || ad.referral_code,
        status: ad.status,
        moderationStatus: ad.moderationStatus || ad.moderation_status,
        moderationNotes: ad.moderationNotes || ad.moderation_notes,
        moderatedAt: ad.moderatedAt || ad.moderated_at,
        moderatorId: ad.moderatorId || ad.moderator_id,
        viewCount: ad.viewCount || ad.view_count,
        createdAt: ad.createdAt || ad.created_at,
        updatedAt: ad.updatedAt || ad.updated_at,
        expiresAt: ad.expiresAt || ad.expires_at,
        deletedAt: ad.deletedAt || ad.deleted_at,
        locationName: ad.locationName || ad.location_name,
        locationType: ad.locationType || ad.location_type,
        subcategoryName: ad.subcategoryName || ad.subcategory_name,
        categoryName: ad.categoryName || ad.category_name,
        brandName: ad.brandName || ad.brand_name,
        sellerUsername: ad.sellerUsername || ad.seller_username,
        userIdentityVerified: ad.userIdentityVerified || ad.user_identity_verified,
        photos: ad.photos || [],
        filters: ad.filters || []
      }));

      return {
        ads: processedAds,
        pagination: response.pagination
      };
    },
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
    gcTime: 5 * 60 * 1000, // Garde en mémoire 5 minutes
    retry: 1, // Only 1 retry to avoid long waits
    retryDelay: 1000, // 1 second delay between retries
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= (data?.pagination?.totalPages || 1)) {
      setCurrentPage(page);
      // Scroll vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    ads: data?.ads || [],
    pagination: data?.pagination || null,
    isLoading: isLoading || isFetching,
    error: error?.message || null,
    goToPage,
    refetch
  };
};

export default useHomeAds;
