// Configuration centralisée de l'API
// Pour switcher entre environnements, modifiez uniquement cette ligne :
export const SERVER_ENV = 'local'; // 'prod' ou 'local'

// Configuration automatique selon l'environnement
export const API_BASE_URL = SERVER_ENV === 'prod'
  ? 'https://cambizzle.seed-innov.com/api'
  : 'http://localhost:8080/api';

// Export de l'URL complète du serveur (sans /api) pour les assets
export const SERVER_BASE_URL = SERVER_ENV === 'prod'
  ? 'https://cambizzle.seed-innov.com'
  : 'http://localhost:8080';

console.log(`🌐 API configurée en mode ${SERVER_ENV.toUpperCase()}: ${API_BASE_URL}`);