import axios from 'axios';
import storageService from '../services/storageService';

// Configuration centralisée de l'API via variables d'environnement
export const SERVER_ENV = import.meta.env.VITE_SERVER_ENV || 'prod';

// URLs depuis les variables d'environnement
const API_URL_PROD = import.meta.env.VITE_API_URL_PROD || 'https://www.cambizzle.seed-innov.com/api';
const API_URL_LOCAL = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8080/api';

// Configuration automatique selon l'environnement
export const API_BASE_URL = SERVER_ENV === 'prod' ? API_URL_PROD : API_URL_LOCAL;

// Export de l'URL complète du serveur (avec /api) pour les uploads et assets
export const SERVER_BASE_URL = API_BASE_URL;

// Créer une instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes timeout par défaut
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurer le timeout par défaut pour toutes les requêtes axios
axios.defaults.timeout = 30000;

// Configurer l'intercepteur axios pour ajouter automatiquement le token à toutes les requêtes
api.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
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

// Intercepteur pour gérer les erreurs (timeout, auth, etc.)
const handleResponseError = (error) => {
  // Gestion du timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    error.message = 'La requête a pris trop de temps. Veuillez réessayer.';
  }

  // Gestion des erreurs réseau
  if (!error.response && error.message === 'Network Error') {
    error.message = 'Erreur de connexion. Vérifiez votre connexion internet.';
  }

  // Si le token est expiré ou invalide (401), nettoyer le storage
  if (error.response?.status === 401) {
    storageService.clearAuth();
    // Rediriger vers la page d'accueil si nécessaire
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }

  return Promise.reject(error);
};

// Appliquer l'intercepteur à l'instance api
api.interceptors.response.use((response) => response, handleResponseError);

// Appliquer aussi à axios global pour les appels directs
axios.interceptors.response.use((response) => response, handleResponseError);