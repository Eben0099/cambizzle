import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // CodeIgniter4 API URL

class AdminService {
  constructor() {
    // S'assurer que le token est toujours dans les headers
    this.setAuthHeader();
  }

  // Set authorization header pour les requêtes admin
  setAuthHeader() {
    const token = localStorage.getItem('token');
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
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  // Méthode utilitaire pour vérifier si l'utilisateur est admin
  isAuthenticated() {
    return !!localStorage.getItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }

  async getAds() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/admin/ads`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
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
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw error;
    }
  }
}

export default new AdminService();