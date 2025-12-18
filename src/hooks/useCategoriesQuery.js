import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../services/categoriesService';

/**
 * Hook pour récupérer toutes les catégories avec leurs sous-catégories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
    staleTime: 30 * 60 * 1000, // Cache 30 minutes (données statiques)
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook pour récupérer une catégorie spécifique
 */
export const useCategory = (categoryId) => {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoriesService.getCategoryById(categoryId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!categoryId,
  });
};
