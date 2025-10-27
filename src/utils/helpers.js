import { SERVER_BASE_URL } from '../config/api';

// Construction de l'URL complète pour les photos
export const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  
  // Si l'URL est déjà complète (commence par http), la retourner telle quelle
  if (photoPath.startsWith('http')) {
    // Nettoyer les URLs malformées du backend
    let cleanUrl = photoPath;
    
    // Corriger le protocole
    cleanUrl = cleanUrl.replace(/^http:\/\//, 'https://');
    
    // Supprimer www.
    cleanUrl = cleanUrl.replace('www.cambizzle.seed-innov.com', 'cambizzle.seed-innov.com');
    
    // Nettoyer les chemins redondants/exposés
    cleanUrl = cleanUrl.replace(/\/api\/home\/[^\/]+\/public_html\/cambizzle\/api\//, '/');
    
    // S'assurer que l'URL commence bien par le bon domaine
    if (cleanUrl.includes('cambizzle.seed-innov.com') && !cleanUrl.startsWith('https://cambizzle.seed-innov.com/')) {
      const pathPart = cleanUrl.split('cambizzle.seed-innov.com')[1] || '';
      cleanUrl = `https://cambizzle.seed-innov.com${pathPart}`;
    }
    
    return cleanUrl;
  }
  
  // Si c'est une URL data (base64), la retourner telle quelle
  if (photoPath.startsWith('data:')) return photoPath;
  
  // Si c'est une URL blob (pour les aperçus temporaires), la retourner telle quelle
  if (photoPath.startsWith('blob:')) return photoPath;
  
  // Sinon, construire l'URL complète avec l'API base URL
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
};

// Formatage des prix en FCFA
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Prix non spécifié';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Formatage des prix en euros (pour la compatibilité)
export const formatPriceEUR = (price) => {
  if (!price) return 'Price not specified';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Formatage des dates
export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

// Formatage relatif des dates
export const formatRelativeDate = (date) => {
  if (!date) return '';
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `About ${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `About ${Math.floor(diffInSeconds / 3600)} h ago`;
  if (diffInSeconds < 604800) return `About ${Math.floor(diffInSeconds / 86400)} d ago`;

  return formatDate(date);
};

// Validation email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation téléphone français
export const isValidPhone = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

// Génération d'ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Génération de code de parrainage
export const generateReferralCode = (username) => {
  const prefix = username.slice(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}${suffix}`;
};

// Calcul de réduction
export const calculateDiscount = (originalPrice, discountPercent) => {
  if (!originalPrice || !discountPercent) return originalPrice;
  const discount = (originalPrice * discountPercent) / 100;
  return originalPrice - discount;
};

// Formatage de la taille de fichier
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validation de fichier image
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non supporté' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Fichier trop volumineux (max 5MB)' };
  }
  
  return { valid: true };
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Slug generation
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return Math.round(d);
};

// Calculate time ago from a date
export const calculateTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
};
