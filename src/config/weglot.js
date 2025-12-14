/**
 * Weglot Configuration
 * 
 * Pour obtenir votre clé API:
 * 1. Créer un compte sur https://weglot.com
 * 2. Aller dans Dashboard > Project Settings
 * 3. Copier votre API Key
 */

export const WEGLOT_CONFIG = {
  // 🔑 API Key (À REMPLACER)
  // Obtenir sur: https://dashboard.weglot.com/
  apiKey: 'wg_ae911012147db25714794d78c84042a35',
  
  // 🌍 Langue source (langue d'origine de votre site)
  originalLanguage: 'en',
  
  // 🗣️ Langues de destination
  destinationLanguages: [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' }
  ],
  
  // 📍 Configuration pour le Cameroun
  // Les langues les plus parlées
  cameroonLanguages: [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ],
  
  // ⚙️ Options Weglot
  options: {
    // Auto switch basé sur la langue du navigateur
    autoSwitch: true,
    
    // Cacher le switcher par défaut (on va créer un custom)
    hideSwitch: true,
    
    // Cache les traductions
    cache: true,
    
    // Traduire dynamiquement le contenu ajouté via JS
    dynamicTranslation: true,
    
    // Exclure certains éléments de la traduction
    excludedBlocks: [
      '.notranslate',
      'code',
      'pre'
    ],
    
    // ⭐ IMPORTANT: Options pour traduire TOUTES les pages
    // Traiter le contenu modifié au runtime
    enableAutoUpdate: true,
    
    // Profondeur de traduction (0 = limité, 1 = standard, 2 = complet)
    translateCompletePage: true
  }
};

export default WEGLOT_CONFIG;
