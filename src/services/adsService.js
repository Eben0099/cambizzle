import { generateId, formatPrice, calculateDiscount } from '../utils/helpers';
import { AD_STATUS, CATEGORIES } from '../utils/constants';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Données mockées pour les annonces


class AdsService {
  async getSubcategoriesByCategory(categoryId) {
    try {
      this.token = localStorage.getItem('token');
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}/subcategories`);
      console.log('✅ Sous-catégories récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération sous-catégories:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération des sous-catégories';
      throw new Error(errorMessage);
    }
  }
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setAuthHeader() {
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async getAdsFromAPI(page = 1, perPage = 8) {
    try {
      console.log('📊 Récupération des annonces depuis l\'API:', { page, perPage });
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params: { page, per_page: perPage }
      });

      console.log('✅ Annonces récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération annonces:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces';

      throw new Error(errorMessage);
    }
  }

  async getAdCreationData() {
    try {
      console.log('📋 Récupération des données de création d\'annonce...');
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads/creation-data`);

      console.log('✅ Données de création récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération données création:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des données de création';

      throw new Error(errorMessage);
    }
  }

  async getSubcategoryFields(subcategorySlug) {
    try {
      console.log('🔧 Récupération des champs pour la sous-catégorie:', subcategorySlug);
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/subcategories/${subcategorySlug}/fields`);

      console.log('✅ Champs sous-catégorie récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération champs sous-catégorie:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des champs';

      throw new Error(errorMessage);
    }
  }

  async createAd(adData) {
    try {
      console.log('📝 Création d\'annonce - Service appelé depuis CreateAd ✅');
      console.log('🔍 Type des données reçues:', adData instanceof FormData ? 'FormData' : typeof adData);

      if (adData instanceof FormData) {
        console.log('📤 Contenu FormData envoyé:');
        for (let [key, value] of adData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
      }

      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      console.log('🚀 Envoi vers l\'API:', `${API_BASE_URL}/ads`);

      // Log final du contenu envoyé juste avant l'appel
      console.log('📤 === CONTENU FINAL ENVOYÉ À L\'API ===');
      if (adData instanceof FormData) {
        for (let [key, value] of adData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ${key}: "${value}"`);
          }
        }
      }
      console.log('📤 === FIN CONTENU ===');

      const response = await axios.post(`${API_BASE_URL}/ads`, adData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Annonce créée avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création annonce:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data complète:', error.response?.data);

      // Log détaillé des messages d'erreur
      if (error.response?.data?.messages) {
        console.error('📋 Messages d\'erreur détaillés:');
        Object.entries(error.response.data.messages).forEach(([field, messages]) => {
          console.error(`  ${field}:`, Array.isArray(messages) ? messages.join(', ') : messages);
        });
      }

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
      console.log('📊 Récupération des annonces avec filtres:', params);
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params: params
      });

      console.log('✅ Annonces récupérées avec filtres:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération annonces avec filtres:', error);
      
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

  async deleteAd(id) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'DELETE' });
    } catch (error) {
      throw error;
    }
  }

  async searchAds(query, filters = {}) {
    try {
      console.log('🔍 Recherche d\'annonces:', { query, filters });
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      // Combine query et filtres dans les paramètres
      const params = {
        q: query,
        ...filters
      };

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params: params
      });

      console.log('✅ Résultats de recherche récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recherche d\'annonces:', error);
      
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
      console.log('📊 Récupération des annonces par catégorie:', { categoryId, params });
      this.token = localStorage.getItem('token');
      this.setAuthHeader();
      
      // Construction des paramètres de requête
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params
      };
      
      console.log('🔗 URL appelée:', `${API_BASE_URL}/ads/category/${categoryId}`, queryParams);
      
      const response = await axios.get(`${API_BASE_URL}/ads/category/${categoryId}`, {
        params: queryParams
      });
      
      console.log('✅ Annonces de catégorie récupérées:', {
        adsCount: response.data.ads?.length || 0,
        category: response.data.category?.name,
        pagination: response.data.pagination,
        filters: response.data.filters
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération annonces par catégorie:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces par catégorie';
      throw new Error(errorMessage);
    }
  }

  // Récupère les annonces d'une sous-catégorie
  async getAdsBySubcategory(subcategorySlug, params = {}) {
    try {
      console.log('📊 Récupération des annonces par sous-catégorie (slug):', { subcategorySlug, params });
      this.token = localStorage.getItem('token');
      this.setAuthHeader();
      
      // Construction des paramètres de requête
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params
      };
      
      console.log('🔗 URL appelée:', `${API_BASE_URL}/ads/subcategory/${subcategorySlug}`, queryParams);
      
      const response = await axios.get(`${API_BASE_URL}/ads/subcategory/${subcategorySlug}`, {
        params: queryParams
      });
      
      console.log('✅ Annonces de sous-catégorie récupérées:', {
        adsCount: response.data.ads?.length || 0,
        subcategory: response.data.subcategory?.name,
        category: response.data.category?.name,
        pagination: response.data.pagination,
        filters: response.data.filters
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération annonces par sous-catégorie:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces par sous-catégorie';
      throw new Error(errorMessage);
    }
  }
}

export const adsService = new AdsService();
