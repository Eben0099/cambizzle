import { generateId, formatPrice, calculateDiscount } from '../utils/helpers';
import { AD_STATUS, CATEGORIES } from '../utils/constants';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import logger from '../utils/logger';
import storageService from './storageService';

// Données mockées pour les annonces


class AdsService {
  /**
   * Récupère une annonce par son slug depuis l'API backend
   * @param {string} slug - Le slug de l'annonce
   * @returns {Promise<Object>} - Les données de l'annonce
   */
  async getAdBySlug(slug) {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/ads/${slug}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur lors de la récupération de l\'annonce';
      throw new Error(errorMessage);
    }
  }
  async getSubcategoriesByCategory(categoryId) {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération des sous-catégories';
      throw new Error(errorMessage);
    }
  }
  constructor() {
    this.token = storageService.getToken();
  }

  setAuthHeader() {
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async getAdsFromAPI(page = 1, perPage = 8, search = '') {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();

      const params = { 
        page, 
        per_page: perPage,
        moderation_status: 'approved'
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params
      });

      return response.data;
    } catch (error) {

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces';

      throw new Error(errorMessage);
    }
  }

  async getAdCreationData() {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads/creation-data`);

      return response.data;
    } catch (error) {

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des données de création';

      throw new Error(errorMessage);
    }
  }

  async getSubcategoryFields(subcategorySlug) {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/subcategories/${subcategorySlug}/fields`);

      return response.data;
    } catch (error) {

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des champs';

      throw new Error(errorMessage);
    }
  }

  async createAd(adData) {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();

      const response = await axios.post(`${API_BASE_URL}/ads`, adData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {

      // Essayer d'extraire le message d'erreur le plus spécifique
      let errorMessage = error.message || 'Erreur lors de la création de l\'annonce';

      if (error.response?.data?.messages) {
        // Si on a des messages détaillés, les formater
        const messages = error.response.data.messages;
        const firstField = Object.keys(messages)[0];
        if (firstField && messages[firstField]) {
          const fieldMessages = Array.isArray(messages[firstField]) ? messages[firstField] : [messages[firstField]];
          errorMessage = `${firstField}: ${fieldMessages[0]}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = `Erreur ${error.response.data.error}`;
      }

      throw new Error(errorMessage);
    }
  }
  // Simulation d'appel API avec données mockées
  async mockApiCall(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (endpoint.startsWith('/ads') && options.method === 'GET') {
          // GET /ads - Liste des annonces avec filtres
          const { page = 1, limit = 20, category, subcategory, priceMin, priceMax, location, type, condition } = options.params || {};

          let filteredAds = [...mockAds];

          // Application des filtres
          if (category) {
            filteredAds = filteredAds.filter(ad => ad.category === category);
          }
          if (subcategory) {
            filteredAds = filteredAds.filter(ad => ad.tags && ad.tags.includes(subcategory));
          }
          if (priceMin) {
            filteredAds = filteredAds.filter(ad => ad.price >= parseInt(priceMin));
          }
          if (priceMax) {
            filteredAds = filteredAds.filter(ad => ad.price <= parseInt(priceMax));
          }
          if (location) {
            filteredAds = filteredAds.filter(ad =>
              ad.location.city.toLowerCase().includes(location.toLowerCase())
            );
          }
          if (type) {
            filteredAds = filteredAds.filter(ad => ad.type === type);
          }
          if (condition) {
            filteredAds = filteredAds.filter(ad => ad.condition === condition);
          }
          
          // Pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedAds = filteredAds.slice(startIndex, endIndex);
          
          resolve({
            data: paginatedAds,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(filteredAds.length / limit),
              totalItems: filteredAds.length,
              limit
            }
          });
        } else if (endpoint.startsWith('/ads/') && options.method === 'GET') {
          // GET /ads/:id - Détail d'une annonce
          const adId = endpoint.split('/')[2];
          const ad = mockAds.find(a => a.id === adId);
          if (ad) {
            resolve(ad);
          } else {
            reject(new Error('Annonce non trouvée'));
          }
        } else if (endpoint === '/ads' && options.method === 'POST') {
          // POST /ads - Création d'annonce
          const newAd = {
            id: generateId(),
            ...options.body,
            status: 'pending',
            views: 0,
            favorites: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockAds.unshift(newAd);
          resolve(newAd);
        } else if (endpoint.startsWith('/ads/') && options.method === 'PUT') {
          // PUT /ads/:id - Mise à jour d'annonce
          const adId = endpoint.split('/')[2];
          const adIndex = mockAds.findIndex(a => a.id === adId);
          if (adIndex !== -1) {
            mockAds[adIndex] = {
              ...mockAds[adIndex],
              ...options.body,
              updatedAt: new Date().toISOString()
            };
            resolve(mockAds[adIndex]);
          } else {
            reject(new Error('Annonce non trouvée'));
          }
        } else if (endpoint.startsWith('/ads/') && options.method === 'DELETE') {
          // DELETE /ads/:id - Suppression d'annonce
          const adId = endpoint.split('/')[2];
          const adIndex = mockAds.findIndex(a => a.id === adId);
          if (adIndex !== -1) {
            mockAds.splice(adIndex, 1);
            resolve({ success: true });
          } else {
            reject(new Error('Annonce non trouvée'));
          }
        } else if (endpoint === '/ads/search') {
          // POST /ads/search - Recherche d'annonces
          const { query, filters = {} } = options.body;
          let results = mockAds.filter(ad => 
            ad.title.toLowerCase().includes(query.toLowerCase()) ||
            ad.description.toLowerCase().includes(query.toLowerCase()) ||
            ad.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          );
          
          // Application des filtres additionnels
          Object.keys(filters).forEach(key => {
            if (filters[key]) {
              if (key === 'category') {
                results = results.filter(ad => ad.category === filters[key]);
              } else if (key === 'subcategory') {
                results = results.filter(ad => ad.tags && ad.tags.includes(filters[key]));
              } else if (key === 'priceMin') {
                results = results.filter(ad => ad.price >= parseInt(filters[key]));
              } else if (key === 'priceMax') {
                results = results.filter(ad => ad.price <= parseInt(filters[key]));
              } else if (key === 'location') {
                results = results.filter(ad =>
                  ad.location.city.toLowerCase().includes(filters[key].toLowerCase())
                );
              } else if (key === 'type') {
                results = results.filter(ad => ad.type === filters[key]);
              } else if (key === 'condition') {
                results = results.filter(ad => ad.condition === filters[key]);
              }
            }
          });
          
          resolve({
            data: results,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: results.length,
              limit: results.length
            }
          });
        }
      }, 300);
    });
  }

  async getAds(params = {}) {
    try {
      logger.log('📊 Récupération des annonces avec filtres:', params);
      this.token = storageService.getToken();
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params: params
      });

      logger.log('✅ Annonces récupérées avec filtres:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur récupération annonces avec filtres:', error);
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces';

      throw new Error(errorMessage);
    }
  }

  async getAdById(id) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'GET' });
    } catch (error) {
      throw error;
    }
  }


  async updateAd(id, adData) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'PUT', body: adData });
    } catch (error) {
      throw error;
    }
  }

  async updateAdBySlug(slug, adData) {
    try {
      logger.log('📝 Mise à jour d\'annonce - Service appelé depuis UpdateAd ✅');
      logger.log('🔍 Type des données reçues:', adData instanceof FormData ? 'FormData' : typeof adData);

      if (adData instanceof FormData) {
        logger.log('📤 Contenu FormData envoyé:');
        for (let [key, value] of adData.entries()) {
          if (value instanceof File) {
            logger.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            logger.log(`  ${key}: ${value}`);
          }
        }
      }

      this.token = storageService.getToken();
      this.setAuthHeader();

      logger.log('🚀 Envoi vers l\'API:', `${API_BASE_URL}/ads/${slug}`);

      // Log final du contenu envoyé juste avant l'appel
      logger.log('📤 === CONTENU FINAL ENVOYÉ À L\'API ===');
      if (adData instanceof FormData) {
        for (let [key, value] of adData.entries()) {
          if (value instanceof File) {
            logger.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            logger.log(`  ${key}: "${value}"`);
          }
        }
      }
      logger.log('📤 === FIN CONTENU ===');

      const response = await axios.post(`${API_BASE_URL}/ads/${slug}`, adData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      logger.log('✅ Annonce mise à jour avec succès:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur mise à jour annonce:', error);
      logger.error('📄 Status code:', error.response?.status);
      logger.error('📋 Response data complète:', error.response?.data);

      // Log détaillé des messages d'erreur
      if (error.response?.data?.messages) {
        logger.error('📋 Messages d\'erreur détaillés:');
        Object.entries(error.response.data.messages).forEach(([field, messages]) => {
          logger.error(`  ${field}:`, Array.isArray(messages) ? messages.join(', ') : messages);
        });
      }

      // Essayer d'extraire le message d'erreur le plus spécifique
      let errorMessage = error.message || 'Erreur lors de la mise à jour de l\'annonce';

      if (error.response?.data?.messages) {
        // Si on a des messages détaillés, les formater
        const messages = error.response.data.messages;
        const firstField = Object.keys(messages)[0];
        if (firstField && messages[firstField]) {
          const fieldMessages = Array.isArray(messages[firstField]) ? messages[firstField] : [messages[firstField]];
          errorMessage = `${firstField}: ${fieldMessages[0]}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = `Erreur ${error.response.data.error}`;
      }

      throw new Error(errorMessage);
    }
  }

  async deleteAd(id) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'DELETE' });
    } catch (error) {
      throw error;
    }
  }

  async searchAds(query, filters = {}) {
    try {
      logger.log('🔍 Recherche d\'annonces:', { query, filters });
      this.token = storageService.getToken();
      this.setAuthHeader();

      // Combine query et filtres dans les paramètres
      const params = {
        q: query,
        ...filters
      };

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params: params
      });

      logger.log('✅ Résultats de recherche récupérés:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur recherche d\'annonces:', error);
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la recherche d\'annonces';

      throw new Error(errorMessage);
    }
  }

  async reportAd(adId, reason, description) {
    try {
      // Simulation d'envoi de rapport
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Signalement envoyé' });
        }, 500);
      });
    } catch (error) {
      throw error;
    }
  }

  async favoriteAd(adId) {
    try {
      // Simulation d'ajout aux favoris
      return new Promise((resolve) => {
        setTimeout(() => {
          const ad = mockAds.find(a => a.id === adId);
          if (ad) {
            ad.favorites += 1;
          }
          resolve({ success: true });
        }, 300);
      });
    } catch (error) {
      throw error;
    }
  }

  async unfavoriteAd(adId) {
    try {
      // Simulation de suppression des favoris
      return new Promise((resolve) => {
        setTimeout(() => {
          const ad = mockAds.find(a => a.id === adId);
          if (ad && ad.favorites > 0) {
            ad.favorites -= 1;
          }
          resolve({ success: true });
        }, 300);
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserAds(userId) {
    try {
      const userAds = mockAds.filter(ad => ad.sellerId === userId);
      return {
        data: userAds,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: userAds.length,
          limit: userAds.length
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupère les annonces d'une catégorie
  async getAdsByCategory(categoryId, params = {}) {
    try {
      logger.log('📊 Récupération des annonces par catégorie:', { categoryId, params });
      this.token = storageService.getToken();
      this.setAuthHeader();
      
      // Construction des paramètres de requête
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params
      };
      
      logger.log('🔗 URL appelée:', `${API_BASE_URL}/ads/category/${categoryId}`, queryParams);
      
      const response = await axios.get(`${API_BASE_URL}/ads/category/${categoryId}`, {
        params: queryParams
      });
      
      logger.log('✅ Annonces de catégorie récupérées:', {
        adsCount: response.data.ads?.length || 0,
        category: response.data.category?.name,
        pagination: response.data.pagination,
        filters: response.data.filters
      });
      
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur récupération annonces par catégorie:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces par catégorie';
      throw new Error(errorMessage);
    }
  }

  // Récupère les filtres disponibles pour une sous-catégorie
  async getFiltersBySubcategory(subcategorySlug) {
    try {
      logger.log('🔧 Récupération des filtres pour la sous-catégorie:', subcategorySlug);
      this.token = storageService.getToken();
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/filters/by-subcategory/${subcategorySlug}`);

      logger.log('✅ Filtres récupérés:', {
        count: response.data?.length || 0,
        filters: response.data
      });
      
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur récupération filtres:', error);
      
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des filtres';
      throw new Error(errorMessage);
    }
  }

  // Récupère les annonces d'une sous-catégorie
  async getAdsBySubcategory(subcategorySlug, params = {}) {
    try {
      logger.log('📊 Récupération des annonces par sous-catégorie (slug):', { subcategorySlug, params });
      this.token = storageService.getToken();
      this.setAuthHeader();
      
      // Construction des paramètres de requête
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params
      };
      
      logger.log('🔗 URL appelée:', `${API_BASE_URL}/ads/subcategory/${subcategorySlug}`, queryParams);
      
      const response = await axios.get(`${API_BASE_URL}/ads/subcategory/${subcategorySlug}`, {
        params: queryParams
      });
      
      logger.log('✅ Annonces de sous-catégorie récupérées:', {
        adsCount: response.data.ads?.length || 0,
        subcategory: response.data.subcategory?.name,
        category: response.data.category?.name,
        pagination: response.data.pagination,
        filters: response.data.filters
      });
      
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur récupération annonces par sous-catégorie:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces par sous-catégorie';
      throw new Error(errorMessage);
    }
  }

  /**
   * Récupère la liste des plans de boost actifs
   * @returns {Promise<Array>} - Liste des plans de boost
   */
  async getPromotionPacks() {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();
      logger.log('🔎 Récupération des plans de boost');
      const response = await axios.get(`${API_BASE_URL}/promotion-packs`);
      logger.log('✅ Plans de boost récupérés:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur récupération plans de boost:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur lors de la récupération des plans de boost';
      throw new Error(errorMessage);
    }
  }

  /**
   * Vérifie le statut d'un paiement spécifique auprès de Campay
   * @param {string|number} paymentId - ID du paiement
   * @returns {Promise<Object>} - Statut du paiement
   */
  async checkPaymentStatus(paymentId) {
    try {
      this.token = storageService.getToken();
      this.setAuthHeader();
      logger.log('🔎 Vérification statut paiement:', paymentId);
      const response = await axios.get(`${API_BASE_URL}/boost/check-payment/${paymentId}`);
      logger.log('✅ Statut paiement récupéré:', response.data);
      return response.data;
    } catch (error) {
      logger.error('❌ Erreur vérification statut paiement:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur lors de la vérification du paiement';
      throw new Error(errorMessage);
    }
  }
}

export const adsService = new AdsService();
