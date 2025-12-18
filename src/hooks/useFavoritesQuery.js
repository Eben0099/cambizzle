import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService';

/**
 * Hook pour récupérer les favoris de l'utilisateur
 */
export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(),
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Hook pour vérifier si une annonce est en favori
 */
export const useFavoriteStatus = (adId) => {
  return useQuery({
    queryKey: ['favorite-status', adId],
    queryFn: () => favoriteService.checkFavorite(adId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!adId,
  });
};

/**
 * Hook pour ajouter/retirer des favoris avec invalidation automatique
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, isFavorite }) => 
      isFavorite 
        ? favoriteService.removeFavorite(adId)
        : favoriteService.addFavorite(adId),
    onSuccess: (_, variables) => {
      // Invalider les caches concernés
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-status', variables.adId] });
    },
  });
};
