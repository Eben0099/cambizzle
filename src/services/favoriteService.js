import api from '../config/api';

const favoriteService = {
  toggleFavorite: async (adId) => {
    try {
      const response = await api.post(`/favorite/ads/${adId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeFavorite: async (adId) => {
    try {
      const response = await api.delete(`/favorite/ads/${adId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkFavoriteStatus: async (adId) => {
    try {
      const response = await api.get(`/favorite/ads/${adId}`);
      if (response.data && response.data.status === 'success') {
        return response.data.data.isFavorite || false;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  getFavorites: async () => {
    try {
      const response = await api.get('/favorite/ads');
      if (response.data && response.data.status === 'success') {
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      throw error;
    }
  }
};

export default favoriteService;
