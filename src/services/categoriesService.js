import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class CategoriesService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setAuthHeader() {
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async getCategoriesWithStats() {
    try {
      console.log('📊 Récupération des catégories avec statistiques...');
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/categories/stats`);
      console.log('✅ Catégories récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des catégories';

      throw new Error(errorMessage);
    }
  }
}

const categoriesService = new CategoriesService();
export default categoriesService;
