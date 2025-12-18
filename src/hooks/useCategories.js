import { useQuery } from '@tanstack/react-query';
import categoriesService from '../services/categoriesService';

const useCategories = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesService.getCategoriesWithStats();

      // Conversion snake_case vers camelCase
      const processedCategories = response.data.map(category => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        iconPath: category.iconPath || category.icon_path,
        iconUrl: category.iconUrl || category.icon_url,
        isActive: category.isActive || category.is_active,
        displayOrder: category.displayOrder || category.display_order,
        totalAds: category.totalAds || category.total_ads,
        subcategories: category.subcategories?.map(sub => ({
          id: sub.id,
          categoryId: sub.categoryId || sub.category_id,
          slug: sub.slug,
          name: sub.name,
          iconPath: sub.iconPath || sub.icon_path,
          iconUrl: sub.iconUrl || sub.icon_url,
          isActive: sub.isActive || sub.is_active,
          displayOrder: sub.displayOrder || sub.display_order,
          totalAds: sub.totalAds || sub.total_ads
        })) || []
      }));

      return processedCategories;
    },
    staleTime: 30 * 60 * 1000, // Cache 30 minutes (données statiques)
    gcTime: 60 * 60 * 1000, // Garde en mémoire 1 heure
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    categories: data || [],
    isLoading,
    error: error?.message || null,
    refetch
  };
};

export default useCategories;
