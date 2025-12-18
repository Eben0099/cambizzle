import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adsService } from '../services/adsService';

const useHomeAds = (initialPage = 1, perPage = 8) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ads', 'home', currentPage, perPage],
    queryFn: async () => {
      const response = await adsService.getAdsFromAPI(currentPage, perPage);

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
        userVerified: ad.userVerified || ad.user_verified,
        photos: ad.photos || [],
        filters: ad.filters || []
      }));

      return {
        ads: processedAds,
        pagination: response.pagination
      };
    },
    staleTime: 3 * 60 * 1000, // Cache 3 minutes
    gcTime: 10 * 60 * 1000, // Garde en mémoire 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= (data?.pagination?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return {
    ads: data?.ads || [],
    pagination: data?.pagination || null,
    isLoading,
    error: error?.message || null,
    goToPage,
    refetch
  };
};

export default useHomeAds;
