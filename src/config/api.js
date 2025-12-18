import axios from 'axios';

// Configuration centralisée de l'API
// Pour switcher entre environnements, modifiez uniquement cette ligne :
export const SERVER_ENV = 'prod'; // 'prod' ou 'local'

// Configuration automatique selon l'environnement
export const API_BASE_URL = SERVER_ENV === 'prod'
  ? 'https://cambizzle.seed-innov.com/api'
  : 'http://localhost:8080/api';

// Export de l'URL complète du serveur (avec /api) pour les uploads et assets
export const SERVER_BASE_URL = SERVER_ENV === 'prod'
  ? 'https://cambizzle.seed-innov.com/api'
  : 'http://localhost:8080/api';

// Créer une instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Configurer l'intercepteur axios pour ajouter automatiquement le token à toutes les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Intercepteur pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le token est expiré ou invalide (401), nettoyer le localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rediriger vers la page d'accueil si nécessaire
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);