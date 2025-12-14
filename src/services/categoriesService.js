import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class CategoriesService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setAuthHeader() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async getCategoriesWithStats() {
    try {
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/categories/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async createSubcategory(data) {
    try {
      this.setAuthHeader();
      const response = await axios.post(`${API_BASE_URL}/admin/referentials/subcategories`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async updateSubcategory(id, data) {
    try {
      this.setAuthHeader();
      const response = await axios.put(`${API_BASE_URL}/admin/referentials/subcategories/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async deleteSubcategory(id) {
    try {
      this.setAuthHeader();
      const response = await axios.delete(`${API_BASE_URL}/admin/referentials/subcategories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}

const categoriesService = new CategoriesService();
export default categoriesService;
