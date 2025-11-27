import { useState, useEffect, useCallback } from 'react';
import { adsService } from '../services/adsService';

const useHomeAds = (initialPage = 1, perPage = 8) => {
  const [ads, setAds] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAds = useCallback(async (page = initialPage) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Chargement des annonces pour la page d\'accueil:', page);

      const response = await adsService.getAdsFromAPI(page, perPage);

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

      console.log('✅ Annonces traitées:', processedAds.length);
      setAds(processedAds);
      setPagination(response.pagination);
    } catch (err) {
      console.error('❌ Erreur chargement annonces:', err);
      setError(err.message);
      setAds([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [initialPage, perPage]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      loadAds(page);
    }
  }, [loadAds, pagination]);

  return {
    ads,
    pagination,
    isLoading,
    error,
    goToPage,
    refetch: () => loadAds(pagination?.currentPage || 1)
  };
};

export default useHomeAds;
