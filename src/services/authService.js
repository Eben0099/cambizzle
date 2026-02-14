import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storageService from './storageService';

class AuthService {
  constructor() {
    this.token = storageService.getToken();
  }

  // Set authorization header for authenticated requests
  setAuthHeader() {
    // Toujours récupérer le token actuel du storage
    const currentToken = storageService.getToken();
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
      storageService.setToken(this.token);

      // Sauvegarder aussi l'utilisateur pour la persistance
      if (response.data.data.user) {
        storageService.setUser(response.data.data.user);
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
      storageService.setToken(this.token);

      // Sauvegarder aussi l'utilisateur pour la persistance
      if (response.data.user) {
        storageService.setUser(response.data.user);
      }
      
      this.setAuthHeader();
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  }

  async getCurrentUser() {
    try {
      // Récupérer le token actuel du storage
      this.token = storageService.getToken();

      if (!this.token) {
        throw new Error('Token not found');
      }

      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  async updateProfile(userData) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = storageService.getToken();
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
      this.token = storageService.getToken();
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
      this.token = storageService.getToken();
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
      const tokenFromStorage = storageService.getToken();

      // Vérifier si le token est valide (pas "undefined" ou "null")
      if (!tokenFromStorage || tokenFromStorage === 'undefined' || tokenFromStorage === 'null') {
        storageService.removeToken();
        throw new Error('Token not found - veuillez vous reconnecter');
      }

      this.token = tokenFromStorage;

      // Vérifier le format du JWT
      const tokenParts = this.token.split('.');
      if (tokenParts.length !== 3) {
        storageService.removeToken();
        throw new Error('Token JWT invalide');
      }

      this.setAuthHeader();

      const response = await axios.post(`${API_BASE_URL}/seller-profiles`, sellerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la création du profil vendeur');
    }
  }

  async updateUserProfile(userData) {
    try {
      // Récupérer le token actuel avant l'appel
      this.token = storageService.getToken();

      if (!this.token) {
        throw new Error('Token not found');
      }

      this.setAuthHeader();

      // Déterminer si c'est un FormData ou un objet JSON
      const isFormData = userData instanceof FormData;

      const response = await axios.post(`${API_BASE_URL}/users/me`, userData, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data'
        } : {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {

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
      this.token = storageService.getToken();

      if (!this.token) {
        throw new Error('Token not found');
      }

      this.setAuthHeader();

      const response = await axios.put(`${API_BASE_URL}/seller-profiles/me`, sellerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil vendeur');
    }
  }

  logout() {
    this.token = null;
    storageService.removeToken();
  }

  // ==================== OTP Methods ====================

  /**
   * Send OTP for registration or password reset
   * @param {string} phone - Phone number in international format (e.g., +237612345678)
   * @param {'registration' | 'password_reset'} purpose - Purpose of OTP
   * @returns {Promise<{success: boolean, message: string, data: {channel: string, expires_in_minutes: number}}>}
   */
  async sendOTP(phone, purpose = 'registration') {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/otp/send`, {
        phone,
        purpose
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to send OTP');
      err.code = errorData?.code;
      err.retryAfter = errorData?.data?.retry_after;
      throw err;
    }
  }

  /**
   * Verify OTP code
   * @param {string} phone - Phone number in international format
   * @param {string} code - 6-digit OTP code
   * @param {'registration' | 'password_reset'} purpose - Purpose of OTP
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifyOTP(phone, code, purpose = 'registration') {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, {
        phone,
        code,
        purpose
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Invalid verification code');
      err.code = errorData?.code;
      err.attemptsRemaining = errorData?.data?.attempts_remaining;
      throw err;
    }
  }

  /**
   * Request OTP for password reset
   * @param {string} phone - Phone number in international format
   * @param {string} channel - Channel to send OTP (whatsapp or sms)
   * @returns {Promise<{success: boolean, message: string, data: {channel: string, expires_in_minutes: number}}>}
   */
  async requestPasswordResetOTP(phone, channel = 'whatsapp') {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password/request-otp`, {
        phone,
        channel
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to request password reset');
      err.code = errorData?.code;
      throw err;
    }
  }

  /**
   * Reset password using OTP
   * @param {string} phone - Phone number in international format
   * @param {string} code - 6-digit OTP code
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async resetPasswordWithOTP(phone, code, newPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password/reset-with-otp`, {
        phone,
        code,
        new_password: newPassword
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      const err = new Error(errorData?.message || 'Failed to reset password');
      err.code = errorData?.code;
      err.attemptsRemaining = errorData?.data?.attempts_remaining;
      throw err;
    }
  }
}

export const authService = new AuthService();
