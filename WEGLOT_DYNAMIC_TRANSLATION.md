# Traduction du Contenu Dynamique avec Weglot + React

## Problème

Weglot fonctionne parfaitement pour le contenu statique HTML, mais dans une SPA React :
- Le contenu est chargé dynamiquement via des appels API
- React utilise un Virtual DOM qui ne déclenche pas toujours les mutations DOM que Weglot détecte
- Résultat : le contenu dynamique (titres d'annonces, descriptions, etc.) n'est pas traduit

## Solution Validée

### 1. Hook `useWeglotTranslate`

Utiliser l'API `Weglot.translate()` pour traduire manuellement le contenu dynamique et stocker le résultat dans le state React.

**Fichier** : `src/hooks/useWeglotRetranslate.js`

```jsx
import { useWeglotTranslate } from '../hooks/useWeglotRetranslate';

// Dans le composant
const { translatedText: translatedTitle } = useWeglotTranslate(ad?.title || '');
const { translatedText: translatedDescription } = useWeglotTranslate(ad?.description || '');

// Dans le JSX
<h1>{translatedTitle || ad.title}</h1>
<p>{translatedDescription || ad.description}</p>
```

### 2. Refresh de Page au Changement de Langue

Pour garantir que tout le contenu (statique + dynamique) est correctement traduit, on rafraîchit la page lors du changement de langue.

**Fichier** : `src/components/LanguageSwitcher.jsx`

```jsx
const handleLanguageChange = (langCode) => {
  if (langCode === currentLang) {
    setIsOpen(false);
    return;
  }

  changeLanguage(langCode);
  setCurrentLang(langCode);
  setIsOpen(false);

  // Rafraîchir la page pour que Weglot traduise tout
  setTimeout(() => {
    window.location.reload();
  }, 100);
};
```

## Comment Ça Fonctionne

1. **Chargement initial** :
   - Weglot détecte la langue préférée (localStorage ou navigateur)
   - Le contenu statique est traduit automatiquement par Weglot
   - Le hook `useWeglotTranslate` appelle `Weglot.translate()` pour le contenu dynamique

2. **Changement de langue** :
   - L'utilisateur clique sur une nouvelle langue
   - La préférence est sauvegardée (i18n + localStorage)
   - La page est rafraîchie
   - Au rechargement, tout est traduit correctement

3. **Navigation SPA** :
   - Quand l'utilisateur navigue vers une nouvelle page
   - Le nouveau contenu dynamique est automatiquement traduit via le hook

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Page React                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │ Contenu Statique│    │    Contenu Dynamique        │ │
│  │ (Labels, menus) │    │    (API data)               │ │
│  └────────┬────────┘    └─────────────┬───────────────┘ │
│           │                           │                 │
│           ▼                           ▼                 │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │    Weglot       │    │   useWeglotTranslate()      │ │
│  │  (automatique)  │    │   Weglot.translate() API    │ │
│  └─────────────────┘    └─────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Fichiers Concernés

| Fichier | Rôle |
|---------|------|
| `src/hooks/useWeglotRetranslate.js` | Hook pour traduction manuelle |
| `src/components/LanguageSwitcher.jsx` | Switcher avec refresh |
| `src/components/WeglotProvider.jsx` | Initialisation Weglot |
| `src/config/weglot.js` | Configuration Weglot |
| `src/pages/AdDetail.jsx` | Exemple d'utilisation |

## Utilisation sur d'Autres Pages

Pour traduire du contenu dynamique sur une nouvelle page :

```jsx
import { useWeglotTranslate } from '../hooks/useWeglotRetranslate';

const MyComponent = ({ data }) => {
  // Traduire chaque champ dynamique
  const { translatedText: translatedName } = useWeglotTranslate(data?.name || '');
  const { translatedText: translatedBio } = useWeglotTranslate(data?.bio || '');

  return (
    <div>
      <h1>{translatedName || data.name}</h1>
      <p>{translatedBio || data.bio}</p>
    </div>
  );
};
```

## Avantages de Cette Approche

1. **Pas de clignotement** : La traduction est stockée dans le state React
2. **Pas de conflit DOM** : On ne manipule pas directement le DOM
3. **Réactif** : Se met à jour quand la langue change
4. **Simple** : Un seul hook à utiliser

## Limitations

- Chaque appel à `useWeglotTranslate` consomme des requêtes Weglot
- Pour de longues listes, préférer le refresh de page
- Les hooks doivent être appelés au top level du composant (règle des hooks React)

## Date de Validation

2025-12-19
