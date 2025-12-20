/**
 * StorageService - Service centralisé pour la gestion du localStorage
 *
 * Avantages:
 * - Centralisation de tous les accès au storage
 * - Gestion des erreurs (quota exceeded, parsing errors)
 * - Facilite le passage à un autre storage (sessionStorage, IndexedDB)
 * - Typage des clés pour éviter les typos
 * - Méthodes utilitaires pour JSON
 */

// Clés utilisées dans l'application
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

class StorageService {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  /**
   * Récupère une valeur du storage
   * @param {string} key - Clé de stockage
   * @returns {string|null} - Valeur ou null
   */
  get(key) {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error(`StorageService: Error getting "${key}"`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur
   * @param {string} key - Clé de stockage
   * @param {string} value - Valeur à stocker
   * @returns {boolean} - Succès de l'opération
   */
  set(key, value) {
    try {
      this.storage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`StorageService: Error setting "${key}"`, error);
      return false;
    }
  }

  /**
   * Supprime une valeur
   * @param {string} key - Clé de stockage
   * @returns {boolean} - Succès de l'opération
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`StorageService: Error removing "${key}"`, error);
      return false;
    }
  }

  /**
   * Récupère et parse une valeur JSON
   * @param {string} key - Clé de stockage
   * @returns {any|null} - Objet parsé ou null
   */
  getJSON(key) {
    try {
      const value = this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`StorageService: Error parsing JSON for "${key}"`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur en la convertissant en JSON
   * @param {string} key - Clé de stockage
   * @param {any} value - Valeur à stocker
   * @returns {boolean} - Succès de l'opération
   */
  setJSON(key, value) {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`StorageService: Error stringifying JSON for "${key}"`, error);
      return false;
    }
  }

  /**
   * Vide tout le storage
   * @returns {boolean} - Succès de l'opération
   */
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('StorageService: Error clearing storage', error);
      return false;
    }
  }

  // ==================== Méthodes spécifiques Auth ====================

  /**
   * Récupère le token d'authentification
   * @returns {string|null}
   */
  getToken() {
    return this.get(STORAGE_KEYS.TOKEN);
  }

  /**
   * Stocke le token d'authentification
   * @param {string} token
   * @returns {boolean}
   */
  setToken(token) {
    return this.set(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * Supprime le token d'authentification
   * @returns {boolean}
   */
  removeToken() {
    return this.remove(STORAGE_KEYS.TOKEN);
  }

  /**
   * Vérifie si un token existe
   * @returns {boolean}
   */
  hasToken() {
    return !!this.getToken();
  }

  // ==================== Méthodes spécifiques User ====================

  /**
   * Récupère les données utilisateur
   * @returns {Object|null}
   */
  getUser() {
    return this.getJSON(STORAGE_KEYS.USER);
  }

  /**
   * Stocke les données utilisateur
   * @param {Object} user
   * @returns {boolean}
   */
  setUser(user) {
    return this.setJSON(STORAGE_KEYS.USER, user);
  }

  /**
   * Supprime les données utilisateur
   * @returns {boolean}
   */
  removeUser() {
    return this.remove(STORAGE_KEYS.USER);
  }

  // ==================== Méthodes Auth combinées ====================

  /**
   * Sauvegarde les données d'authentification (token + user)
   * @param {string} token
   * @param {Object} user
   * @returns {boolean}
   */
  setAuth(token, user) {
    const tokenSet = this.setToken(token);
    const userSet = this.setUser(user);
    return tokenSet && userSet;
  }

  /**
   * Supprime toutes les données d'authentification
   * @returns {boolean}
   */
  clearAuth() {
    const tokenRemoved = this.removeToken();
    const userRemoved = this.removeUser();
    return tokenRemoved && userRemoved;
  }

  /**
   * Récupère toutes les données d'authentification
   * @returns {{ token: string|null, user: Object|null }}
   */
  getAuth() {
    return {
      token: this.getToken(),
      user: this.getUser(),
    };
  }

  /**
   * Retourne le header Authorization pour les requêtes API
   * @returns {string|null}
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}

// Export d'une instance singleton
const storageService = new StorageService();

export default storageService;
