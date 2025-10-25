# Guide de Remplacement des Images SEO

## 📸 Images par défaut actuelles

Les images suivantes sont des placeholders temporaires et doivent être remplacées:

### 1. Image OpenGraph principale
**Fichier**: `src/config/seo.js`
**Ligne**: `defaultOgImage`
**Actuel**: `https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&h=630&fit=crop`
**À remplacer par**: Votre propre image

### 2. Logo de l'organisation
**Fichier**: `src/config/seo.js`
**Ligne**: `logoImage`
**Actuel**: `https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop`
**À remplacer par**: Votre logo officiel

## 🎨 Spécifications des images

### Image OpenGraph (defaultOgImage)
- **Dimensions recommandées**: 1200 x 630 pixels
- **Format**: JPG ou PNG
- **Taille max**: < 1 MB
- **Aspect ratio**: 1.91:1
- **Usage**: Partage sur réseaux sociaux (Facebook, WhatsApp, LinkedIn, Twitter)

### Logo (logoImage)
- **Dimensions recommandées**: 400 x 400 pixels (carré)
- **Format**: PNG avec fond transparent
- **Taille max**: < 200 KB
- **Usage**: Schema.org Organization, favicon

## 🔧 Comment remplacer les images

### Option 1: Images hébergées localement (Recommandé)

1. **Créer le dossier**:
   ```bash
   mkdir public/assets
   ```

2. **Ajouter vos images**:
   - `public/assets/og-image.jpg` (1200x630)
   - `public/assets/logo.png` (400x400)

3. **Mettre à jour `src/config/seo.js`**:
   ```javascript
   export const SEO_CONFIG = {
     // ...
     defaultOgImage: '/assets/og-image.jpg',
     logoImage: '/assets/logo.png',
     // ...
   };
   ```

### Option 2: Images hébergées sur CDN

Si vous avez un CDN:

```javascript
export const SEO_CONFIG = {
  // ...
  defaultOgImage: 'https://cdn.cambizzle.com/images/og-image.jpg',
  logoImage: 'https://cdn.cambizzle.com/images/logo.png',
  // ...
};
```

## 🎨 Conseils pour créer une bonne image OG

### Contenu de l'image:
- Logo Cambizzle
- Slogan: "Buy and Sell in Cameroon"
- Couleurs de marque (#D6BA69)
- Design simple et clair
- Texte lisible même en petit format

### Outils recommandés:
- **Canva**: Templates OpenGraph gratuits
- **Figma**: Design professionnel
- **Photoshop**: Pour les designers

### Template suggéré:
```
┌─────────────────────────────────┐
│                                 │
│     [LOGO CAMBIZZLE]            │
│                                 │
│   Buy and Sell in Cameroon      │
│                                 │
│   🏠 🚗 📱 👕 🎮                │
│                                 │
└─────────────────────────────────┘
```

## 📍 Où sont utilisées ces images?

### defaultOgImage:
- Balise `<meta property="og:image">`
- Balise `<meta name="twitter:image">`
- Utilisée quand une page n'a pas d'image spécifique

### logoImage:
- Schema.org Organization
- Possiblement pour favicon
- Profil d'entreprise dans les résultats de recherche

## ✅ Vérifier après remplacement

### 1. Tester les meta tags:
- Ouvrir l'outil de développement (F12)
- Console → `document.querySelector('meta[property="og:image"]').content`

### 2. Tester le partage:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

### 3. Vérifier les dimensions:
```javascript
// Dans la console du navigateur
const img = new Image();
img.src = 'votre-url-image';
img.onload = () => console.log(`${img.width}x${img.height}`);
```

## 🚀 Déploiement

Après avoir remplacé les images:

1. Commit et push:
   ```bash
   git add public/assets/
   git add src/config/seo.js
   git commit -m "Update SEO images"
   git push
   ```

2. Clear les caches:
   - Cache du navigateur
   - CDN cache (si applicable)
   - Facebook/Twitter cache (via leurs outils)

3. Attendre l'indexation:
   - Google peut prendre 1-2 jours
   - Les réseaux sociaux mettent à jour immédiatement après clear cache

## 💡 Bonus: Images dynamiques par annonce

Les images des annonces individuelles sont déjà gérées automatiquement:
- Elles utilisent la première photo de l'annonce
- Fallback vers `defaultOgImage` si pas de photo
- Configuré dans `src/pages/AdDetail.jsx`

Aucune action nécessaire pour les annonces! ✅
