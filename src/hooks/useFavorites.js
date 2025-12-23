import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import favoriteService from '../services/favoriteService';
import { toast } from '../components/ui/use-toast';

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les favoris avec cache
  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await favoriteService.getFavorites();
      if (response.status === 'success' && response.data) {
        // Transform snake_case to camelCase for AdCard compatibility
        const transformedItems = (response.data.items || []).map(item => ({
          ...item,
          id: item.id || item.ad_id,
          adId: item.ad_id,
          viewCount: item.viewCount || item.view_count || 0,
          createdAt: item.createdAt || item.created_at,
          updatedAt: item.updatedAt || item.updated_at,
          locationName: item.locationName || item.location_name,
          subcategoryName: item.subcategoryName || item.subcategory_name,
          categoryName: item.categoryName || item.category_name,
          originalPrice: item.originalPrice || item.original_price,
          sellerUsername: item.sellerUsername || item.seller_username,
          userIdentityVerified: item.userIdentityVerified || item.user_identity_verified || 0,
          isBoosted: item.isBoosted || item.is_boosted || 0,
          isNegotiable: item.isNegotiable || item.is_negotiable || 0,
          // Transform photos
          photos: (item.photos || []).map(photo => ({
            ...photo,
            originalUrl: photo.originalUrl || photo.original_url,
            thumbnailUrl: photo.thumbnailUrl || photo.thumbnail_url,
          }))
        }));
        return {
          items: transformedItems,
          total: response.data.total || 0
        };
      }
      return { items: [], total: 0 };
    },
    staleTime: 3 * 60 * 1000, // Cache 3 minutes
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated, // Ne charger que si connecté
    retry: 1,
  });

  // Mutation pour toggle favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: (adId) => favoriteService.toggleFavorite(adId),
    // Update optimiste : mettre à jour l'UI avant la réponse serveur
    onMutate: async (adId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Sauvegarder l'état précédent
      const previousFavorites = queryClient.getQueryData(['favorites']);

      // Mettre à jour de façon optimiste
      queryClient.setQueryData(['favorites'], (old) => {
        if (!old) return old;
        
        const isFavorite = old.items.some(fav => fav.id === adId);
        
        if (isFavorite) {
          // Retirer des favoris
          return {
            items: old.items.filter(fav => fav.id !== adId),
            total: old.total - 1
          };
        } else {
          // Pour l'ajout, on invalide pour recharger
          return old;
        }
      });

      return { previousFavorites };
    },
    onError: (err, adId, context) => {
      // Restaurer l'état précédent en cas d'erreur
      queryClient.setQueryData(['favorites'], context.previousFavorites);
      toast({
        title: 'Error',
        description: 'Could not update favorite',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      // Invalider pour recharger les données fraîches du serveur
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleFavorite = async (adId) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to save favorites',
        variant: 'destructive',
      });
      return;
    }

    const wasFavorite = data?.items?.some(fav => fav.id === adId);
    
    try {
      await toggleFavoriteMutation.mutateAsync(adId);
      
      toast({
        title: wasFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: wasFavorite ? 'The ad has been removed from your favorites' : 'The ad has been added to your favorites',
        variant: 'default',
      });
    } catch (error) {
      // Erreur déjà gérée dans onError
    }
  };

  const checkIsFavorite = async (adId) => {
    if (!isAuthenticated) return false;
    try {
      return await favoriteService.checkFavoriteStatus(adId);
    } catch (error) {
      return false;
    }
  };

  return {
    favorites: data?.items || [],
    totalFavorites: data?.total || 0,
    loading: isLoading,
    toggleFavorite,
    isFavorite: (adId) => data?.items?.some(fav => fav.adId === adId.toString()) || false,
    checkIsFavorite,
  };
};

export default useFavorites;
