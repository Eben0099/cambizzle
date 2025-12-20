import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import storageService from './storageService';

class PromotionPackService {
  setAuthHeader() {
    const currentToken = storageService.getToken();
    if (currentToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async getAll(params = {}) {
    this.setAuthHeader();
    const response = await axios.get(`${API_BASE_URL}/promotion-packs`, { params });
    return response.data;
  }

  async create(data) {
    this.setAuthHeader();
    const response = await axios.post(`${API_BASE_URL}/promotion-packs`, data);
    return response.data;
  }

  async update(id, data) {
    this.setAuthHeader();
    const response = await axios.put(`${API_BASE_URL}/promotion-packs/${id}`, data);
    return response.data;
  }

  async delete(id) {
    this.setAuthHeader();
    const response = await axios.delete(`${API_BASE_URL}/promotion-packs/${id}`);
    return response.data;
  }
}

export default new PromotionPackService();
