/**
 * SEO Configuration
 * Centralized configuration for SEO-related constants
 */

export const SEO_CONFIG = {
  // Site Information
  siteName: 'Cambizzle',
  siteUrl: 'https://cambizzle.com',
  
  // Default Meta Tags
  defaultTitle: 'Cambizzle | Buy and Sell in Cameroon',
  defaultDescription: 'Discover the best deals for buying and selling in Cameroon. Browse ads, post your own, and connect with buyers and sellers effortlessly.',
  defaultKeywords: 'buy, sell, classifieds, ads, Cameroon, marketplace, Cambizzle',
  
  // Default Images
  // TODO: Remplacer par vos propres images dans /public/assets/
  defaultOgImage: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&h=630&fit=crop',
  logoImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop',
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/cambizzle',
    twitter: 'https://twitter.com/cambizzle',
    instagram: 'https://instagram.com/cambizzle',
    twitterHandle: '@cambizzle'
  },
  
  // Theme
  themeColor: '#D6BA69',
  
  // Locale
  locale: 'en_CM',
  
  // Organization Info (pour Schema.org)
  organization: {
    name: 'Cambizzle',
    legalName: 'Cambizzle Ltd',
    foundingDate: '2024',
    address: {
      country: 'CM',
      countryName: 'Cameroon'
    }
  }
};

/**
 * Génère une URL d'image par défaut avec texte personnalisé
 * Utilise le service placeholder.com
 */
export const getPlaceholderImage = (text = 'Cambizzle', width = 1200, height = 630) => {
  return `https://via.placeholder.com/${width}x${height}/D6BA69/000000?text=${encodeURIComponent(text)}`;
};

/**
 * Obtient l'image OG appropriée
 * Priorité: image fournie > image par défaut
 */
export const getOgImage = (imageUrl) => {
  if (!imageUrl) return SEO_CONFIG.defaultOgImage;
  
  // Si l'URL est relative, la convertir en URL absolue
  if (imageUrl.startsWith('/')) {
    return `${SEO_CONFIG.siteUrl}${imageUrl}`;
  }
  
  return imageUrl;
};

/**
 * Formate le titre avec le nom du site
 */
export const formatTitle = (title) => {
  if (!title) return SEO_CONFIG.defaultTitle;
  if (title.includes('|')) return title;
  return `${title} | ${SEO_CONFIG.siteName}`;
};

/**
 * Tronque la description à la longueur optimale pour SEO
 */
export const formatDescription = (description, maxLength = 155) => {
  if (!description) return SEO_CONFIG.defaultDescription;
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength - 3) + '...';
};

/**
 * Génère une URL complète à partir d'un chemin
 */
export const getFullUrl = (path = '') => {
  return `${SEO_CONFIG.siteUrl}${path}`;
};

export default SEO_CONFIG;
