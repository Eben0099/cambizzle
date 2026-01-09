import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storageService from './storageService';

class AdminService {
  // Récupérer les codes de parrainage
  async getReferralCodes() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/referral-codes`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }
  // Créer une marque
  async createBrand(brandData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/admin/referentials/brands`, brandData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Mettre à jour une marque
  async updateBrand(brandId, brandData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/referentials/brands/${brandId}`, brandData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }
  // ============= GESTION DES MARQUES =============
  // Récupérer la liste des marques avec pagination
  async getBrands(page = 1, perPage = 1000) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/referentials/brands`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Supprimer une marque
  async deleteBrand(brandId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/admin/referentials/brands/${brandId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }
  constructor() {
    // S'assurer que le token est toujours dans les headers
    this.setAuthHeader();
  }

  // ============= GESTION DES LOCALISATIONS =============
  // Récupérer la liste des localisations
  async getLocations() {
    try {
      // Lister public ou admin ? Postman montre les deux. Utilisons le public pour la liste.
      const response = await axios.get(`${API_BASE_URL}/locations`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Créer une localisation
  async createLocation(locationData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/admin/referentials/locations`, locationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une localisation
  async updateLocation(locationId, locationData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/referentials/locations/${locationId}`, locationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une localisation
  async deleteLocation(locationId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/admin/referentials/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Set authorization header pour les requêtes admin
  setAuthHeader() {
    const token = storageService.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // Récupérer les statistiques du dashboard admin
  async getDashboardStats() {
    try {
      this.setAuthHeader(); // S'assurer que l'auth header est défini
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);
      return response.data;
    } catch (error) {
      // Gestion spécifique des erreurs d'authentification
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Méthode utilitaire pour vérifier si l'utilisateur est admin
  isAuthenticated() {
    return !!storageService.getToken();
  }

  // Méthodes pour les autres endpoints admin (à ajouter plus tard)

  // Gestion des annonces
  async getAds(page = 1, limit = 20, search = '') {
    try {
      this.setAuthHeader();
      const params = { page, limit };
      if (search) params.q = search;

      const response = await axios.get(`${API_BASE_URL}/ads`, { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async getPendingAds() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/ads/pending`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async approveAd(adId, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/ads/${adId}/approve`, {
        notes
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async rejectAd(adId, reason, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/ads/${adId}/reject`, {
        reason,
        notes
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Gestion des utilisateurs
  async getUsers(page = 1, perPage = 20) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async getUserDetails(userId) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/v1/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async suspendUser(userId, reason, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
        reason,
        notes
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async unsuspendUser(userId, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/unsuspend`, {
        notes
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async verifyUserIdentity(userId, notes) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/verify-identity`, {
        notes
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async getAds() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/ads`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async getCategories() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/categories`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Récupérer les logs de modération avec pagination
  async getModerationLogs(page = 1, limit = 50) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/moderation-logs`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Récupérer les logs récents pour le dashboard (dernières activités)
  async getRecentModerationLogs(limit = 10) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/moderation-logs`, {
        params: { page: 1, limit }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // ============= GESTION DES CATÉGORIES =============

  // Récupérer la liste des catégories
  async getCategories(page = 1, perPage = 20) {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/referentials/categories`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Créer une catégorie
  async createCategory(categoryData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/admin/referentials/categories`, categoryData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Mettre à jour une catégorie
  async updateCategory(categoryId, categoryData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/referentials/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Supprimer une catégorie
  async deleteCategory(categoryId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/admin/referentials/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Fetch referral codes
  async getReferralCodes() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/referralcodes`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // ============= GESTION DES FILTRES =============

  // Récupérer tous les filtres par catégories avec leurs options
  async getFilters() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/referentials/filters`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Créer un nouveau filtre
  async createFilter(filterData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/admin/referentials/filters`, filterData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Mettre à jour un filtre
  async updateFilter(filterId, filterData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/referentials/filters/${filterId}`, filterData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Supprimer un filtre
  async deleteFilter(filterId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/admin/referentials/filters/${filterId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Créer une nouvelle option pour un filtre
  async createFilterOption(filterId, optionData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/admin/referentials/filters/${filterId}/options`, optionData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Mettre à jour une option de filtre
  async updateFilterOption(filterId, optionId, optionData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/referentials/filters/${filterId}/options/${optionId}`, optionData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Supprimer une option de filtre
  async deleteFilterOption(filterId, optionId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/admin/referentials/filters/${filterId}/options/${optionId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Récupérer un fichier sous forme de blob (pour les PDFs authentifiés)
  async getFileBlob(url) {
    try {
      this.setAuthHeader();
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // ============= GESTION DES RÔLES =============
  async updateUserRole(userId, roleId) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/role`, {
        role_id: Number(roleId)
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // ============= GESTION DU CONTENU (CMS) =============
  async getSettings() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/settings/cms`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async updateSettings(settingsData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/settings/cms`, settingsData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        storageService.removeToken();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // ============= GESTION DES FAQS (CMS) =============
  async createFaq(faqData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/settings/cms/faqs`, faqData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateFaq(faqId, faqData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/settings/cms/faqs/${faqId}`, faqData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteFaq(faqId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/settings/cms/faqs/${faqId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============= GESTION DES SECTIONS (CMS) =============
  async createSection(sectionData) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/settings/cms/sections`, sectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateSection(sectionId, sectionData) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/settings/cms/sections/${sectionId}`, sectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(sectionId) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/settings/cms/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();