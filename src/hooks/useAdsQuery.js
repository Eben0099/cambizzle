import { useQuery, useQueries } from '@tanstack/react-query';
import { adsService } from '../services/adsService';

/**
 * Hook personnalisé pour récupérer les annonces avec cache automatique
 * - Cache de 5 minutes par défaut
 * - Évite les appels répétés
 * - Gère loading/error automatiquement
 */
export const useHomeAds = (page = 1, perPage = 8) => {
  return useQuery({
    queryKey: ['ads', 'home', page, perPage],
    queryFn: () => adsService.getAds(page, perPage),
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    gcTime: 10 * 60 * 1000, // Garde en mémoire 10 minutes (ancien cacheTime)
    retry: 2, // Réessaye 2 fois en cas d'erreur
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook pour récupérer une annonce spécifique par slug
 */
export const useAdBySlug = (slug) => {
  return useQuery({
    queryKey: ['ad', slug],
    queryFn: () => adsService.getAdBySlug(slug),
    staleTime: 10 * 60 * 1000, // Cache 10 minutes
    gcTime: 20 * 60 * 1000,
    retry: 2,
    enabled: !!slug, // Ne pas faire de requête si slug est vide
  });
};

/**
 * Hook pour récupérer les annonces filtrées
 */
export const useFilteredAds = (params) => {
  return useQuery({
    queryKey: ['ads', 'filtered', params],
    queryFn: () => adsService.getAdsByFilters(params),
    staleTime: 3 * 60 * 1000, // Cache 3 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: !!params, // Ne pas faire de requête si pas de paramètres
  });
};

/**
 * Hook pour récupérer les annonces par catégorie
 */
export const useAdsByCategory = (categoryId, params = {}) => {
  return useQuery({
    queryKey: ['ads', 'category', categoryId, params],
    queryFn: () => adsService.getAdsByCategory(categoryId, params),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: !!categoryId,
  });
};

/**
 * Hook pour récupérer les annonces par sous-catégorie
 */
export const useAdsBySubcategory = (subcategorySlug, params = {}) => {
  return useQuery({
    queryKey: ['ads', 'subcategory', subcategorySlug, params],
    queryFn: () => adsService.getAdsBySubcategory(subcategorySlug, params),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: !!subcategorySlug,
  });
};

/**
 * Hook pour les données de création d'annonce (catégories, localisations, etc.)
 */
export const useAdCreationData = () => {
  return useQuery({
    queryKey: ['ad-creation-data'],
    queryFn: () => adsService.getAdCreationData(),
    staleTime: 30 * 60 * 1000, // Cache 30 minutes (ces données changent rarement)
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook pour rechercher des annonces
 */
export const useSearchAds = (query, filters = {}) => {
  return useQuery({
    queryKey: ['ads', 'search', query, filters],
    queryFn: () => adsService.searchAds(query, filters),
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!query, // Seulement si query n'est pas vide
  });
};

/**
 * Hook pour récupérer les filtres disponibles pour une sous-catégorie
 */
export const useSubcategoryFilters = (subcategorySlug) => {
  return useQuery({
    queryKey: ['filters', 'subcategory', subcategorySlug],
    queryFn: () => adsService.getFiltersBySubcategory(subcategorySlug),
    staleTime: 30 * 60 * 1000, // Cache 30 minutes (ces données changent rarement)
    gcTime: 60 * 60 * 1000,
    retry: 1,
    enabled: !!subcategorySlug,
  });
};
