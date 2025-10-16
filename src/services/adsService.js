import { generateId, formatPrice, calculateDiscount } from '../utils/helpers';
import { AD_STATUS, CATEGORIES } from '../utils/constants';
import axios from 'axios';

// Données mockées pour les annonces
const mockAds = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max 256GB - État neuf',
    description: 'iPhone 14 Pro Max 256GB couleur Violet Sidéral. Acheté il y a 3 mois, très peu utilisé. Vendu avec boîte d\'origine, chargeur et coque de protection. Aucune rayure, écran parfait.',
    price: 1200,
    originalPrice: 1400,
    discountPercent: 14,
    category: 'multimedia',
    type: 'sell',
    condition: 'like_new',
    status: 'active',
    location: {
      city: 'Paris',
      zipCode: '75001',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
    ],
    sellerId: '2',
    seller: {
      id: '2',
      firstName: 'Marie',
      lastName: 'Dupont',
      avatar: null,
      isVerified: true,
      rating: 4.8,
      totalSales: 45
    },
    views: 156,
    favorites: 12,
    createdAt: '2024-12-10T10:30:00Z',
    updatedAt: '2024-12-10T10:30:00Z',
    isPremium: true,
    tags: ['phones', 'smartphone', 'apple', 'iphone']
  },
  {
    id: '2',
    title: 'Appartement T3 - Centre ville',
    description: 'Magnifique appartement T3 de 75m² en centre ville. Entièrement rénové, cuisine équipée, balcon avec vue dégagée. Proche transports et commerces.',
    price: 850,
    category: 'immobilier',
    type: 'rent',
    condition: 'excellent',
    status: 'active',
    location: {
      city: 'Lyon',
      zipCode: '69001',
      coordinates: { lat: 45.7640, lng: 4.8357 }
    },
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
    ],
    sellerId: '2',
    seller: {
      id: '2',
      firstName: 'Marie',
      lastName: 'Dupont',
      avatar: null,
      isVerified: true,
      rating: 4.8,
      totalSales: 45
    },
    views: 89,
    favorites: 8,
    createdAt: '2024-12-09T14:20:00Z',
    updatedAt: '2024-12-09T14:20:00Z',
    isPremium: false,
    tags: ['apartments', 'appartement', 'location', 'centre-ville']
  },
  {
    id: '3',
    title: 'Vélo électrique Specialized - Excellent état',
    description: 'Vélo électrique Specialized Turbo Vado 3.0. Batterie longue durée, très bon état. Idéal pour trajets urbains et balades.',
    price: 2200,
    originalPrice: 2800,
    discountPercent: 21,
    category: 'vehicules',
    type: 'sell',
    condition: 'good',
    status: 'active',
    location: {
      city: 'Marseille',
      zipCode: '13001',
      coordinates: { lat: 43.2965, lng: 5.3698 }
    },
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500'
    ],
    sellerId: '1',
    seller: {
      id: '1',
      firstName: 'Admin',
      lastName: 'Cambizzle',
      avatar: null,
      isVerified: true,
      rating: 5.0,
      totalSales: 12
    },
    views: 234,
    favorites: 18,
    createdAt: '2024-12-08T09:15:00Z',
    updatedAt: '2024-12-08T09:15:00Z',
    isPremium: true,
    tags: ['cars', 'vélo', 'électrique', 'specialized', 'véhicules']
  },
  {
    id: '4',
    title: 'MacBook Pro M3 16" - Comme neuf',
    description: 'MacBook Pro 16 pouces avec puce M3, 32GB RAM, 1TB SSD. État impeccable, acheté il y a 2 mois. Tous les accessoires inclus.',
    price: 2899,
    category: 'multimedia',
    type: 'sell',
    condition: 'like_new',
    status: 'active',
    location: {
      city: 'Toulouse',
      zipCode: '31000',
      coordinates: { lat: 43.6047, lng: 1.4442 }
    },
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
    ],
    sellerId: '3',
    seller: {
      id: '3',
      firstName: 'Sophie',
      lastName: 'Martin',
      avatar: null,
      isVerified: true,
      rating: 4.9,
      totalSales: 28
    },
    views: 89,
    favorites: 15,
    createdAt: '2024-12-07T16:45:00Z',
    updatedAt: '2024-12-07T16:45:00Z',
    isPremium: true,
    tags: ['computers', 'macbook', 'apple', 'ordinateur', 'portable']
  },
  {
    id: '5',
    title: 'Développeur Full Stack - React/Node.js',
    description: 'Recherche développeur expérimenté en React et Node.js pour projet web. 3 ans minimum d\'expérience. Télétravail possible.',
    price: 45000,
    category: 'emploi',
    type: 'service',
    condition: 'excellent',
    status: 'active',
    location: {
      city: 'Nantes',
      zipCode: '44000',
      coordinates: { lat: 47.2184, lng: -1.5536 }
    },
    images: [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500'
    ],
    sellerId: '4',
    seller: {
      id: '4',
      firstName: 'TechCorp',
      lastName: 'Solutions',
      avatar: null,
      isVerified: true,
      rating: 4.7,
      totalSales: 156
    },
    views: 342,
    favorites: 23,
    createdAt: '2024-12-06T11:20:00Z',
    updatedAt: '2024-12-06T11:20:00Z',
    isPremium: true,
    tags: ['emploi', 'développeur', 'react', 'nodejs', 'fullstack']
  },
  {
    id: '6',
    title: 'Robe de soirée Gucci - Taille 38',
    description: 'Robe de soirée Gucci noire en soie, taille 38. Portée une seule fois pour un événement. État neuf, avec étiquette.',
    price: 1200,
    originalPrice: 2500,
    discountPercent: 52,
    category: 'mode',
    type: 'sell',
    condition: 'like_new',
    status: 'active',
    location: {
      city: 'Nice',
      zipCode: '06000',
      coordinates: { lat: 43.7102, lng: 7.2620 }
    },
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      'https://images.unsplash.com/photo-1583496661160-fb5886a6aaaa?w=500'
    ],
    sellerId: '5',
    seller: {
      id: '5',
      firstName: 'Emma',
      lastName: 'Dubois',
      avatar: null,
      isVerified: false,
      rating: 4.2,
      totalSales: 8
    },
    views: 67,
    favorites: 12,
    createdAt: '2024-12-05T14:30:00Z',
    updatedAt: '2024-12-05T14:30:00Z',
    isPremium: false,
    tags: ['vêtements', 'robe', 'gucci', 'soirée', 'luxe']
  },
  {
    id: '7',
    title: 'Studio meublé centre-ville',
    description: 'Charmant studio de 25m² entièrement meublé en plein centre-ville. Cuisine équipée, salle de bain moderne. Idéal étudiant ou jeune actif.',
    price: 650,
    category: 'immobilier',
    type: 'rent',
    condition: 'excellent',
    status: 'active',
    location: {
      city: 'Bordeaux',
      zipCode: '33000',
      coordinates: { lat: 44.8378, lng: -0.5792 }
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500'
    ],
    sellerId: '6',
    seller: {
      id: '6',
      firstName: 'Pierre',
      lastName: 'Lefebvre',
      avatar: null,
      isVerified: true,
      rating: 4.6,
      totalSales: 34
    },
    views: 198,
    favorites: 29,
    createdAt: '2024-12-04T09:15:00Z',
    updatedAt: '2024-12-04T09:15:00Z',
    isPremium: true,
    tags: ['appartements', 'studio', 'location', 'centre-ville', 'meublé']
  },
  {
    id: '8',
    title: 'Services de ménage - 2h/semaine',
    description: 'Service de ménage professionnel pour appartement 60m². Nettoyage complet, lessive et repassage inclus. Intervention hebdomadaire.',
    price: 80,
    category: 'services',
    type: 'service',
    condition: 'excellent',
    status: 'active',
    location: {
      city: 'Lille',
      zipCode: '59000',
      coordinates: { lat: 50.6292, lng: 3.0573 }
    },
    images: [
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500'
    ],
    sellerId: '7',
    seller: {
      id: '7',
      firstName: 'Clean',
      lastName: 'Home Services',
      avatar: null,
      isVerified: true,
      rating: 4.8,
      totalSales: 89
    },
    views: 156,
    favorites: 18,
    createdAt: '2024-12-03T13:45:00Z',
    updatedAt: '2024-12-03T13:45:00Z',
    isPremium: false,
    tags: ['ménage', 'nettoyage', 'services', 'domicile', 'professionnel']
  },
  {
    id: '9',
    title: 'Console PlayStation 5 + Jeux',
    description: 'PlayStation 5 avec 3 jeux : Spider-Man 2, God of War Ragnarök et FIFA 24. Console en parfait état, tous les câbles inclus.',
    price: 550,
    originalPrice: 650,
    discountPercent: 15,
    category: 'loisirs',
    type: 'sell',
    condition: 'excellent',
    status: 'active',
    location: {
      city: 'Strasbourg',
      zipCode: '67000',
      coordinates: { lat: 48.5734, lng: 7.7521 }
    },
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500'
    ],
    sellerId: '8',
    seller: {
      id: '8',
      firstName: 'Lucas',
      lastName: 'Garcia',
      avatar: null,
      isVerified: false,
      rating: 4.1,
      totalSales: 5
    },
    views: 278,
    favorites: 34,
    createdAt: '2024-12-02T17:20:00Z',
    updatedAt: '2024-12-02T17:20:00Z',
    isPremium: false,
    tags: ['jeux', 'playstation', 'ps5', 'console', 'gaming']
  },
  {
    id: '10',
    title: 'Canapé d\'angle en cuir véritable',
    description: 'Magnifique canapé d\'angle en cuir véritable marron, dimensions 280x180cm. Très confortable, état impeccable. Livraison possible.',
    price: 950,
    category: 'maison',
    type: 'sell',
    condition: 'good',
    status: 'active',
    location: {
      city: 'Rennes',
      zipCode: '35000',
      coordinates: { lat: 48.1173, lng: -1.6778 }
    },
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
    ],
    sellerId: '9',
    seller: {
      id: '9',
      firstName: 'Marie',
      lastName: 'Rousseau',
      avatar: null,
      isVerified: true,
      rating: 4.5,
      totalSales: 22
    },
    views: 134,
    favorites: 16,
    createdAt: '2024-12-01T10:30:00Z',
    updatedAt: '2024-12-01T10:30:00Z',
    isPremium: false,
    tags: ['meubles', 'canapé', 'cuir', 'salon', 'décoration']
  },
  {
    id: '11',
    title: 'Voiture Renault Clio 4 - Diesel 2018',
    description: 'Renault Clio 4 1.5 dCi 90ch. 85 000km, entretien à jour, carte grise française. Véhicule en bon état général.',
    price: 8900,
    category: 'vehicules',
    type: 'sell',
    condition: 'good',
    status: 'active',
    location: {
      city: 'Montpellier',
      zipCode: '34000',
      coordinates: { lat: 43.6108, lng: 3.8767 }
    },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500'
    ],
    sellerId: '10',
    seller: {
      id: '10',
      firstName: 'Antoine',
      lastName: 'Moreau',
      avatar: null,
      isVerified: true,
      rating: 4.3,
      totalSales: 7
    },
    views: 445,
    favorites: 28,
    createdAt: '2024-11-30T15:45:00Z',
    updatedAt: '2024-11-30T15:45:00Z',
    isPremium: true,
    tags: ['voiture', 'renault', 'clio', 'diesel', 'automobile']
  },
  {
    id: '12',
    title: 'Réparation smartphones - Atelier mobile',
    description: 'Service de réparation de smartphones à domicile. Écran cassé, batterie, chargeur... Intervention rapide dans toute la région.',
    price: 0,
    category: 'services',
    type: 'service',
    condition: 'excellent',
    status: 'active',
    location: {
      city: 'Grenoble',
      zipCode: '38000',
      coordinates: { lat: 45.1885, lng: 5.7245 }
    },
    images: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500'
    ],
    sellerId: '11',
    seller: {
      id: '11',
      firstName: 'Mobile',
      lastName: 'Repair Pro',
      avatar: null,
      isVerified: true,
      rating: 4.9,
      totalSales: 67
    },
    views: 203,
    favorites: 31,
    createdAt: '2024-11-29T12:15:00Z',
    updatedAt: '2024-11-29T12:15:00Z',
    isPremium: true,
    tags: ['réparation', 'smartphone', 'mobile', 'service', 'technique']
  },
  {
    id: '13',
    title: 'Collection sneakers Nike Air Jordan',
    description: 'Collection de 5 paires de sneakers Air Jordan (taille 42). Modèles rares, état neuf. Collectionneur vend pour manque de place.',
    price: 1800,
    category: 'mode',
    type: 'sell',
    condition: 'like_new',
    status: 'active',
    location: {
      city: 'Dijon',
      zipCode: '21000',
      coordinates: { lat: 47.3220, lng: 5.0415 }
    },
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'
    ],
    sellerId: '12',
    seller: {
      id: '12',
      firstName: 'Thomas',
      lastName: 'Petit',
      avatar: null,
      isVerified: false,
      rating: 3.9,
      totalSales: 3
    },
    views: 98,
    favorites: 22,
    createdAt: '2024-11-28T08:30:00Z',
    updatedAt: '2024-11-28T08:30:00Z',
    isPremium: false,
    tags: ['chaussures', 'nike', 'jordan', 'sneakers', 'collection']
  }
];

const API_BASE_URL = 'http://localhost:8080/api';

class AdsService {
  async getSubcategoriesByCategory(categoryId) {
    try {
      this.token = localStorage.getItem('token');
      this.setAuthHeader();
      const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}/subcategories`);
      console.log('✅ Sous-catégories récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération sous-catégories:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération des sous-catégories';
      throw new Error(errorMessage);
    }
  }
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setAuthHeader() {
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async getAdsFromAPI(page = 1, perPage = 8) {
    try {
      console.log('📊 Récupération des annonces depuis l\'API:', { page, perPage });
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        params: { page, per_page: perPage }
      });

      console.log('✅ Annonces récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération annonces:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des annonces';

      throw new Error(errorMessage);
    }
  }

  async getAdCreationData() {
    try {
      console.log('📋 Récupération des données de création d\'annonce...');
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/ads/creation-data`);

      console.log('✅ Données de création récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération données création:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des données de création';

      throw new Error(errorMessage);
    }
  }

  async getSubcategoryFields(subcategorySlug) {
    try {
      console.log('🔧 Récupération des champs pour la sous-catégorie:', subcategorySlug);
      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      const response = await axios.get(`${API_BASE_URL}/subcategories/${subcategorySlug}/fields`);

      console.log('✅ Champs sous-catégorie récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération champs sous-catégorie:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Erreur lors de la récupération des champs';

      throw new Error(errorMessage);
    }
  }

  async createAd(adData) {
    try {
      console.log('📝 Création d\'annonce - Service appelé depuis CreateAd ✅');
      console.log('🔍 Type des données reçues:', adData instanceof FormData ? 'FormData' : typeof adData);

      if (adData instanceof FormData) {
        console.log('📤 Contenu FormData envoyé:');
        for (let [key, value] of adData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
      }

      this.token = localStorage.getItem('token');
      this.setAuthHeader();

      console.log('🚀 Envoi vers l\'API:', `${API_BASE_URL}/ads`);

      // Log final du contenu envoyé juste avant l'appel
      console.log('📤 === CONTENU FINAL ENVOYÉ À L\'API ===');
      if (adData instanceof FormData) {
        for (let [key, value] of adData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ${key}: "${value}"`);
          }
        }
      }
      console.log('📤 === FIN CONTENU ===');

      const response = await axios.post(`${API_BASE_URL}/ads`, adData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Annonce créée avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création annonce:', error);
      console.error('📄 Status code:', error.response?.status);
      console.error('📋 Response data complète:', error.response?.data);

      // Log détaillé des messages d'erreur
      if (error.response?.data?.messages) {
        console.error('📋 Messages d\'erreur détaillés:');
        Object.entries(error.response.data.messages).forEach(([field, messages]) => {
          console.error(`  ${field}:`, Array.isArray(messages) ? messages.join(', ') : messages);
        });
      }

      // Essayer d'extraire le message d'erreur le plus spécifique
      let errorMessage = error.message || 'Erreur lors de la création de l\'annonce';

      if (error.response?.data?.messages) {
        // Si on a des messages détaillés, les formater
        const messages = error.response.data.messages;
        const firstField = Object.keys(messages)[0];
        if (firstField && messages[firstField]) {
          const fieldMessages = Array.isArray(messages[firstField]) ? messages[firstField] : [messages[firstField]];
          errorMessage = `${firstField}: ${fieldMessages[0]}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = `Erreur ${error.response.data.error}`;
      }

      throw new Error(errorMessage);
    }
  }
  // Simulation d'appel API avec données mockées
  async mockApiCall(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (endpoint.startsWith('/ads') && options.method === 'GET') {
          // GET /ads - Liste des annonces avec filtres
          const { page = 1, limit = 20, category, subcategory, priceMin, priceMax, location, type, condition } = options.params || {};

          let filteredAds = [...mockAds];

          // Application des filtres
          if (category) {
            filteredAds = filteredAds.filter(ad => ad.category === category);
          }
          if (subcategory) {
            filteredAds = filteredAds.filter(ad => ad.tags && ad.tags.includes(subcategory));
          }
          if (priceMin) {
            filteredAds = filteredAds.filter(ad => ad.price >= parseInt(priceMin));
          }
          if (priceMax) {
            filteredAds = filteredAds.filter(ad => ad.price <= parseInt(priceMax));
          }
          if (location) {
            filteredAds = filteredAds.filter(ad =>
              ad.location.city.toLowerCase().includes(location.toLowerCase())
            );
          }
          if (type) {
            filteredAds = filteredAds.filter(ad => ad.type === type);
          }
          if (condition) {
            filteredAds = filteredAds.filter(ad => ad.condition === condition);
          }
          
          // Pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedAds = filteredAds.slice(startIndex, endIndex);
          
          resolve({
            data: paginatedAds,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(filteredAds.length / limit),
              totalItems: filteredAds.length,
              limit
            }
          });
        } else if (endpoint.startsWith('/ads/') && options.method === 'GET') {
          // GET /ads/:id - Détail d'une annonce
          const adId = endpoint.split('/')[2];
          const ad = mockAds.find(a => a.id === adId);
          if (ad) {
            resolve(ad);
          } else {
            reject(new Error('Annonce non trouvée'));
          }
        } else if (endpoint === '/ads' && options.method === 'POST') {
          // POST /ads - Création d'annonce
          const newAd = {
            id: generateId(),
            ...options.body,
            status: 'pending',
            views: 0,
            favorites: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockAds.unshift(newAd);
          resolve(newAd);
        } else if (endpoint.startsWith('/ads/') && options.method === 'PUT') {
          // PUT /ads/:id - Mise à jour d'annonce
          const adId = endpoint.split('/')[2];
          const adIndex = mockAds.findIndex(a => a.id === adId);
          if (adIndex !== -1) {
            mockAds[adIndex] = {
              ...mockAds[adIndex],
              ...options.body,
              updatedAt: new Date().toISOString()
            };
            resolve(mockAds[adIndex]);
          } else {
            reject(new Error('Annonce non trouvée'));
          }
        } else if (endpoint.startsWith('/ads/') && options.method === 'DELETE') {
          // DELETE /ads/:id - Suppression d'annonce
          const adId = endpoint.split('/')[2];
          const adIndex = mockAds.findIndex(a => a.id === adId);
          if (adIndex !== -1) {
            mockAds.splice(adIndex, 1);
            resolve({ success: true });
          } else {
            reject(new Error('Annonce non trouvée'));
          }
        } else if (endpoint === '/ads/search') {
          // POST /ads/search - Recherche d'annonces
          const { query, filters = {} } = options.body;
          let results = mockAds.filter(ad => 
            ad.title.toLowerCase().includes(query.toLowerCase()) ||
            ad.description.toLowerCase().includes(query.toLowerCase()) ||
            ad.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          );
          
          // Application des filtres additionnels
          Object.keys(filters).forEach(key => {
            if (filters[key]) {
              if (key === 'category') {
                results = results.filter(ad => ad.category === filters[key]);
              } else if (key === 'subcategory') {
                results = results.filter(ad => ad.tags && ad.tags.includes(filters[key]));
              } else if (key === 'priceMin') {
                results = results.filter(ad => ad.price >= parseInt(filters[key]));
              } else if (key === 'priceMax') {
                results = results.filter(ad => ad.price <= parseInt(filters[key]));
              } else if (key === 'location') {
                results = results.filter(ad =>
                  ad.location.city.toLowerCase().includes(filters[key].toLowerCase())
                );
              } else if (key === 'type') {
                results = results.filter(ad => ad.type === filters[key]);
              } else if (key === 'condition') {
                results = results.filter(ad => ad.condition === filters[key]);
              }
            }
          });
          
          resolve({
            data: results,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: results.length,
              limit: results.length
            }
          });
        }
      }, 300);
    });
  }

  async getAds(params = {}) {
    try {
      return await this.mockApiCall('/ads', { method: 'GET', params });
    } catch (error) {
      throw error;
    }
  }

  async getAdById(id) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'GET' });
    } catch (error) {
      throw error;
    }
  }


  async updateAd(id, adData) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'PUT', body: adData });
    } catch (error) {
      throw error;
    }
  }

  async deleteAd(id) {
    try {
      return await this.mockApiCall(`/ads/${id}`, { method: 'DELETE' });
    } catch (error) {
      throw error;
    }
  }

  async searchAds(query, filters = {}) {
    try {
      return await this.mockApiCall('/ads/search', { 
        method: 'POST', 
        body: { query, filters } 
      });
    } catch (error) {
      throw error;
    }
  }

  async reportAd(adId, reason, description) {
    try {
      // Simulation d'envoi de rapport
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Signalement envoyé' });
        }, 500);
      });
    } catch (error) {
      throw error;
    }
  }

  async favoriteAd(adId) {
    try {
      // Simulation d'ajout aux favoris
      return new Promise((resolve) => {
        setTimeout(() => {
          const ad = mockAds.find(a => a.id === adId);
          if (ad) {
            ad.favorites += 1;
          }
          resolve({ success: true });
        }, 300);
      });
    } catch (error) {
      throw error;
    }
  }

  async unfavoriteAd(adId) {
    try {
      // Simulation de suppression des favoris
      return new Promise((resolve) => {
        setTimeout(() => {
          const ad = mockAds.find(a => a.id === adId);
          if (ad && ad.favorites > 0) {
            ad.favorites -= 1;
          }
          resolve({ success: true });
        }, 300);
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserAds(userId) {
    try {
      const userAds = mockAds.filter(ad => ad.sellerId === userId);
      return {
        data: userAds,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: userAds.length,
          limit: userAds.length
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export const adsService = new AdsService();
