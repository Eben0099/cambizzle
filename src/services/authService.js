import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set authorization header for authenticated requests
  setAuthHeader() {
    // Toujours récupérer le token actuel du localStorage
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
          } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async login(credentials) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" }
      });

      this.token = response.data.data.token;
      localStorage.setItem('token', this.token);
      
      // Sauvegarder aussi l'utilisateur pour la persistance
      if (response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      this.setAuthHeader();
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
        headers: { "Content-Type": "application/json" }
      });
      this.token = response.data.token;
      localStorage.setItem('token', this.token);
      
      // Sauvegarder aussi l'utilisateur pour la persistance
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      this.setAuthHeader();
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  }

  async getCurrentUser() {
    try {
      console.log('🔐 getCurrentUser - Début récupération utilisateur');
      // Récupérer le token actuel du localStorage
      this.token = localStorage.getItem('token');
      console.log('🔑 Token utilisé:', this.token ? 'présent' : 'absent');

      if (!this.token) {
        throw new Error('Token not found');
      }

      this.setAuthHeader();
      console.log('📡 Appel GET /auth/me');
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      console.log('✅ Réponse brute /auth/me:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCurrentUser:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  async updateProfile(userData) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = localStorage.getItem('token');
      if (!this.token) {
        throw new Error('Token not found');
      }
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = localStorage.getItem('token');
      if (!this.token) {
        throw new Error('Token not found');
      }
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la demande de réinitialisation');
    }
  }

  async submitVerification(documents) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = localStorage.getItem('token');
      if (!this.token) {
        throw new Error('Token not found');
      }
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, documents);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la soumission de vérification');
    }
  }

  async createSellerProfile(sellerData) {
    try {
      // Récupérer le token actuel avant l'appel
      const tokenFromStorage = localStorage.getItem('token');

      // Vérifier si le token est valide (pas "undefined" ou "null")
      if (!tokenFromStorage || tokenFromStorage === 'undefined' || tokenFromStorage === 'null') {
        localStorage.removeItem('token');
        throw new Error('Token not found - veuillez vous reconnecter');
      }

      this.token = tokenFromStorage;

      // Vérifier le format du JWT
      const tokenParts = this.token.split('.');
      if (tokenParts.length !== 3) {
        localStorage.removeItem('token');
        throw new Error('Token JWT invalide');
      }

      this.setAuthHeader();

      console.log('📤 Envoi des données vendeur:', sellerData);
      const response = await axios.post(`${API_BASE_URL}/seller-profiles`, sellerData);
      console.log('✅ Réponse API vendeur:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur détaillée API:', error);
      console.error('🔍 Status code:', error.response?.status);
      console.error('📄 Response data:', error.response?.data);
      console.error('📡 Request data:', sellerData);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la création du profil vendeur');
    }
  }

  async updateUserProfile(userData) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = localStorage.getItem('token');

      if (!this.token) {
        throw new Error('Token not found');
      }

      this.setAuthHeader();

      console.log('👤 Mise à jour profil utilisateur - Données reçues:', userData);

      // Déterminer si c'est un FormData ou un objet JSON
      const isFormData = userData instanceof FormData;

      if (isFormData) {
        console.log('📋 Type: FormData');
        console.log('🔍 Champs FormData:', [...userData.entries()].map(([key, value]) =>
          `${key}: ${value instanceof Blob ? 'Blob(' + value.size + ' bytes, ' + value.type + ')' : value}`
        ));
      } else {
        console.log('📋 Type: JSON');
        console.log('🔍 Clés des données:', Object.keys(userData));
        console.log('📝 Valeurs des données:');
        Object.entries(userData).forEach(([key, value]) => {
          console.log(`  ${key}: ${typeof value} (${value ? value.length || 'non-string' : 'null'})`);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/users/me`, userData, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data'
        } : {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Réponse API mise à jour:', response.data);
      console.log('✅ Profil utilisateur mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil utilisateur:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);
      console.error('🔍 Validation errors:', error.response?.data?.errors);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          (error.response?.data?.errors && Object.values(error.response?.data?.errors).join(', ')) ||
                          error.message ||
                          'Erreur lors de la mise à jour du profil utilisateur';

      throw new Error(`Validation failed: ${errorMessage}`);
    }
  }

  async updateSellerProfile(sellerData) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = localStorage.getItem('token');

      if (!this.token) {
        throw new Error('Token not found');
      }

      this.setAuthHeader();

      console.log('📤 Mise à jour profil vendeur:', sellerData);
      const response = await axios.put(`${API_BASE_URL}/seller-profiles/me`, sellerData);
      console.log('✅ Profil vendeur mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil vendeur:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil vendeur');
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();
