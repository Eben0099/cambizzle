import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storageService from './storageService';

class UserService {
  setAuthHeader() {
    const currentToken = storageService.getToken();
    if (currentToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Submit identity verification document for a user
   * @param {string} userId
   * @param {FormData} formData (fields: document_type, document_number, document)
   * @returns {Promise<Object>}
   */
  async submitIdentityVerification(userId, formData) {
    this.setAuthHeader();
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/verify-identity`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

export default new UserService();
