# 🌍 Guide de Configuration Weglot pour Cambizzle

## 📋 Vue d'ensemble

Weglot est maintenant intégré dans le site pour permettre la traduction automatique entre Français et Anglais (les langues officielles du Cameroun).

## 🔑 Étape 1: Obtenir votre clé API Weglot

### 1. Créer un compte Weglot
1. Aller sur [https://weglot.com](https://weglot.com)
2. Cliquer sur "Start Free Trial" ou "Sign Up"
3. Créer votre compte (email + mot de passe)

### 2. Récupérer votre API Key
1. Se connecter à [https://dashboard.weglot.com](https://dashboard.weglot.com)
2. Aller dans **"Project Settings"** ou **"API Keys"**
3. Copier votre **API Key** (format: `wg_xxxxxxxxxxxxx`)

### 3. Configurer l'API Key dans le code
Ouvrir le fichier: `src/config/weglot.js`

```javascript
export const WEGLOT_CONFIG = {
  // 🔑 Remplacer cette ligne avec votre vraie API Key
  apiKey: 'wg_0123456789abcdef',  // ← Votre clé ici
  
  originalLanguage: 'en',
  // ... reste de la config
};
```

## 🌐 Étape 2: Configurer les langues

Dans le même fichier `src/config/weglot.js`:

```javascript
// Langues disponibles pour le Cameroun
cameroonLanguages: [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
],
```

### Ajouter d'autres langues (optionnel):
```javascript
cameroonLanguages: [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },  // Allemand
  { code: 'es', name: 'Español', flag: '🇪🇸' }   // Espagnol
],
```

## 🎨 Étape 3: Personnaliser l'apparence (optionnel)

### Modifier le style du Language Switcher
Fichier: `src/components/LanguageSwitcher.jsx`

Changer les couleurs:
```javascript
// Bouton principal
className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50"

// Menu déroulant
className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg"

// Langue sélectionnée (couleur accent)
className={`... ${currentLanguage === lang.code ? 'bg-[#D6BA69]/10' : ''}`}
```

## 🚀 Étape 4: Tester la traduction

### 1. Démarrer le serveur de développement
```bash
npm run dev
```

### 2. Vérifier l'intégration
1. Ouvrir le site dans le navigateur
2. Chercher le sélecteur de langue dans le header (🇬🇧 English / 🇫🇷 Français)
3. Cliquer pour changer la langue
4. Vérifier que le contenu se traduit

### 3. Vérifier la console
Ouvrir la console du navigateur (F12), vous devriez voir:
```
✅ Weglot initialized with languages: Français, English
```

Si vous voyez:
```
⚠️ Weglot API key not configured
```
→ Retourner à l'étape 1 pour configurer l'API Key.

## 📝 Fonctionnalités Implémentées

### ✅ Ce qui fonctionne:
- [x] Sélecteur de langue dans le header
- [x] Traduction automatique de tout le contenu
- [x] Détection automatique de la langue du navigateur
- [x] Cache des traductions pour performance
- [x] Drapeaux pour chaque langue
- [x] Animation et UX du switcher
- [x] Disponible pour utilisateurs connectés et non-connectés

### 🎯 Où apparaît le sélecteur:
- Header desktop (à droite, avant les boutons de connexion)
- Visible sur toutes les pages
- Accessible même sans être connecté

## 🛠️ Configuration Avancée

### Exclure des éléments de la traduction

Pour empêcher la traduction de certains éléments, ajouter la classe `notranslate`:

```jsx
// Ne pas traduire un prix
<span className="notranslate">5000 XAF</span>

// Ne pas traduire un nom propre
<h1 className="notranslate">Cambizzle</h1>

// Ne pas traduire du code
<code className="notranslate">const API_KEY = "..."</code>
```

### Personnaliser les options Weglot

Dans `src/config/weglot.js`:

```javascript
options: {
  // Auto switch basé sur la langue du navigateur
  autoSwitch: true,  // false pour désactiver
  
  // Traduire dynamiquement le contenu chargé via JS
  dynamicTranslation: true,
  
  // Exclure des blocs spécifiques
  excludedBlocks: [
    '.notranslate',
    'code',
    'pre',
    '.no-translate'  // Ajouter vos propres classes
  ]
}
```

## 📊 Dashboard Weglot

### Accéder au dashboard:
[https://dashboard.weglot.com](https://dashboard.weglot.com)

### Fonctionnalités disponibles:
- **Statistiques**: Voir les langues les plus utilisées
- **Éditer les traductions**: Améliorer les traductions automatiques
- **Glossaire**: Définir des termes spécifiques (ex: "Cambizzle" ne doit jamais être traduit)
- **Règles de traduction**: Créer des règles personnalisées
- **SEO**: URLs traduites pour meilleur référencement

## 🎓 Bonnes Pratiques

### 1. Glossaire Cambizzle
Dans le dashboard Weglot, ajouter ces termes au glossaire:
- **Cambizzle** → Ne pas traduire
- **XAF** → Ne pas traduire
- **Yaoundé**, **Douala**, etc. → Ne pas traduire

### 2. Vérifier les traductions importantes
Pages à vérifier manuellement:
- Page d'accueil
- Formulaire de création d'annonce
- Termes légaux
- Messages d'erreur

### 3. Tester sur mobile
Le language switcher s'adapte automatiquement:
- Desktop: Affiche le drapeau + nom de langue
- Mobile: Affiche uniquement le drapeau (gain d'espace)

## 🐛 Résolution de Problèmes

### Problème: Le sélecteur de langue n'apparaît pas
**Solutions**:
1. Vérifier que l'API Key est configurée dans `src/config/weglot.js`
2. Vérifier la console pour des erreurs
3. Vider le cache du navigateur

### Problème: Les traductions ne fonctionnent pas
**Solutions**:
1. Vérifier que l'API Key est valide sur dashboard.weglot.com
2. Vérifier que le plan Weglot n'est pas expiré
3. Vérifier la connexion internet

### Problème: Certains éléments ne se traduisent pas
**Solutions**:
1. Retirer la classe `notranslate` si présente
2. Activer `dynamicTranslation: true` dans les options
3. Vérifier les `excludedBlocks` dans la config

### Problème: Les drapeaux ne s'affichent pas
**Solution**: Les emojis de drapeaux peuvent ne pas s'afficher sur certains OS Windows.
Remplacer par des images:
```javascript
// Dans src/config/weglot.js
cameroonLanguages: [
  { code: 'en', name: 'English', flag: '🇬🇧', image: '/flags/gb.png' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', image: '/flags/fr.png' }
]
```

## 📈 Plans Weglot

### Plan Gratuit:
- ✅ 1 langue de destination
- ✅ 2000 mots traduits/mois
- ✅ Parfait pour commencer

### Plan Starter (9€/mois):
- ✅ 5 langues de destination
- ✅ 10 000 mots traduits/mois
- ✅ Édition de traductions
- ✅ Support email

### Plan Business (29€/mois):
- ✅ 10 langues de destination
- ✅ 50 000 mots traduits/mois
- ✅ URLs traduites (SEO)
- ✅ Support prioritaire

## 🎯 Prochaines Étapes

1. [ ] Obtenir API Key Weglot
2. [ ] Configurer dans `src/config/weglot.js`
3. [ ] Tester sur le site
4. [ ] Vérifier les traductions importantes
5. [ ] Ajouter un glossaire dans le dashboard
6. [ ] Promouvoir le multilingue auprès des utilisateurs

## 📞 Support

- **Documentation Weglot**: [https://developers.weglot.com](https://developers.weglot.com)
- **Support Weglot**: [support@weglot.com](mailto:support@weglot.com)
- **React Weglot**: [https://github.com/weglot/react-weglot](https://github.com/weglot/react-weglot)

---

✨ **Félicitations!** Votre site est maintenant prêt pour la traduction multilingue! 🌍
