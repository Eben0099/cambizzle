import { useState, useEffect, useCallback } from 'react';
import categoriesService from '../services/categoriesService';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Chargement des catégories...');

      const response = await categoriesService.getCategoriesWithStats();

      // Conversion snake_case vers camelCase
      const processedCategories = response.data.map(category => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        iconPath: category.iconPath || category.icon_path,
        isActive: category.isActive || category.is_active,
        displayOrder: category.displayOrder || category.display_order,
        totalAds: category.totalAds || category.total_ads,
        subcategories: category.subcategories?.map(sub => ({
          id: sub.id,
          categoryId: sub.categoryId || sub.category_id,
          slug: sub.slug,
          name: sub.name,
          iconPath: sub.iconPath || sub.icon_path,
          isActive: sub.isActive || sub.is_active,
          displayOrder: sub.displayOrder || sub.display_order,
          totalAds: sub.totalAds || sub.total_ads
        })) || []
      }));

      console.log('✅ Catégories traitées:', processedCategories);
      setCategories(processedCategories);
    } catch (err) {
      console.error('❌ Erreur chargement catégories:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: loadCategories
  };
};

export default useCategories;
