import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import favoriteService from '../services/favoriteService';
import { toast } from '../components/ui/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]); // Reset favorites when not authenticated
      setTotalFavorites(0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const response = await favoriteService.getFavorites();
      console.log('API Response:', response);
      if (response.status === 'success' && response.data) {
        console.log('Setting favorites:', response.data.items);
        console.log('Setting total:', response.data.total);
        setFavorites(response.data.items || []);
        setTotalFavorites(response.data.total || 0);
      } else {
        console.log('No valid data in response');
        setFavorites([]);
        setTotalFavorites(0);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
      setTotalFavorites(0);
      toast({
        title: 'Error',
        description: 'Could not load favorites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (adId) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to save favorites',
        variant: 'destructive',
      });
      return;
    }

    try {
      const wasFavorite = favorites.some(fav => fav.id === adId);
      await favoriteService.toggleFavorite(adId);
      await loadFavorites(); // Reload favorites after toggle
      
      console.log(`🤍 Favorite ${wasFavorite ? 'removed from' : 'added to'} ad #${adId}`);
      toast({
        title: wasFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: wasFavorite ? 'The ad has been removed from your favorites' : 'The ad has been added to your favorites',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Could not update favorite',
        variant: 'destructive',
      });
    }
  };

  // Ensure totalFavorites is a number
  const ensuredTotal = typeof totalFavorites === 'number' ? totalFavorites : parseInt(totalFavorites) || 0;
  console.log('Final total favorites:', ensuredTotal);

  const checkIsFavorite = async (adId) => {
    if (!isAuthenticated) return false;
    try {
      return await favoriteService.checkFavoriteStatus(adId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  };

  return {
    favorites: Array.isArray(favorites) ? favorites : [],
    totalFavorites: ensuredTotal,
    loading,
    toggleFavorite,
    isFavorite: (adId) => Array.isArray(favorites) ? favorites.some(fav => fav.adId === adId.toString()) : false,
    checkIsFavorite,
    loadFavorites,
  };
};

export default useFavorites;
