# Système de Filtrage des Annonces par Sous-Catégorie

## Vue d'ensemble

Ce système permet aux utilisateurs de filtrer les annonces en fonction de critères spécifiques à chaque sous-catégorie. Les filtres sont dynamiques et chargés depuis l'API backend.

## Architecture

### 1. Services API

**Fichier**: `src/services/adsService.js`

#### Fonctions disponibles :

- `getFiltersBySubcategory(subcategorySlug)` : Récupère les filtres disponibles pour une sous-catégorie
- `getAdsBySubcategory(subcategorySlug, params)` : Récupère les annonces filtrées d'une sous-catégorie

### 2. Utilitaires

**Fichier**: `src/utils/filterHelpers.js`

#### Fonctions utilitaires :

- `buildFilterQueryParams(selectedFilters)` : Convertit l'objet de filtres en query parameters pour l'API
- `parseFiltersFromURL(searchParams)` : Parse les filtres depuis l'URL
- `hasFilterValue(value)` : Vérifie si un filtre a une valeur
- `countActiveFilters(selectedFilters)` : Compte le nombre de filtres actifs
- `resetFilters()` : Réinitialise tous les filtres
- `formatFilterLabel(filter, value)` : Formate le label d'un filtre pour l'affichage

### 3. Composants de Filtre

**Dossier**: `src/components/filters/`

Chaque type de filtre a son propre composant :

#### FilterSelect.jsx
- Type de filtre : Dropdown (sélection unique)
- Usage : Pour les options prédéfinies

#### FilterRadio.jsx
- Type de filtre : Boutons radio
- Usage : Pour les choix mutuellement exclusifs

#### FilterCheckbox.jsx
- Type de filtre : Cases à cocher
- Usage : Pour la sélection multiple

#### FilterText.jsx
- Type de filtre : Champ texte
- Usage : Pour la saisie libre de texte
- **Fonctionnalité** : Debounce de 500ms pour éviter les appels API excessifs

#### FilterNumber.jsx
- Type de filtre : Champ numérique
- Usage : Pour les valeurs numériques simples
- **Fonctionnalité** : Debounce de 500ms

#### FilterRange.jsx
- Type de filtre : Plage de valeurs (min/max)
- Usage : Pour les fourchettes de prix, tailles, etc.
- **Fonctionnalité** : Debounce de 500ms sur chaque champ

### 4. Composants d'Interface

#### FilterSidebar.jsx
- Composant principal qui affiche tous les filtres disponibles
- Gère l'état des filtres sélectionnés
- Affiche un compteur de filtres actifs
- Bouton de réinitialisation
- Responsive : sidebar fixe sur desktop, modal sur mobile

#### ActiveFilterBadges.jsx
- Affiche les badges des filtres actifs
- Permet de supprimer un filtre individuel
- Affiche le nom du filtre et sa valeur de manière lisible

### 5. Hooks Personnalisés

**Fichier**: `src/hooks/useDebounce.js`

- Implémente un debounce pour retarder les appels API
- Utilisé dans FilterText, FilterNumber, et FilterRange
- Délai par défaut : 500ms

## Format des Données

### Structure d'un filtre (depuis l'API)

```javascript
{
  "id": 1,
  "name": "Couleur",
  "type": "select",  // Types: select, radio, checkbox, text, number, range
  "is_required": 0,
  "display_order": 1,
  "options": [
    {
      "id": 1,
      "filter_id": 1,
      "value": "Rouge",
      "display_order": 1,
      "is_active": 1
    }
  ]
}
```

### Structure de selectedFilters (état local)

```javascript
{
  1: "Rouge",                    // Filtre simple (select, radio, text)
  2: ["Rouge", "Bleu"],          // Filtre multiple (checkbox)
  3: { min: 100000, max: 500000 },  // Filtre range
  4: "42"                        // Filtre number
}
```

### Query Parameters envoyés à l'API

```
filter_1=Rouge
filter_2=Rouge,Bleu
filter_3_min=100000
filter_3_max=500000
filter_4=42
```

## Utilisation dans SubcategoryAds.jsx

### État du composant

```javascript
const [filters, setFilters] = useState([]);              // Filtres disponibles
const [selectedFilters, setSelectedFilters] = useState({});  // Filtres sélectionnés
const [filtersLoading, setFiltersLoading] = useState(false); // État de chargement
const [showMobileFilters, setShowMobileFilters] = useState(false); // Modal mobile
```

### Flux de données

1. **Chargement initial** :
   - Récupération des filtres disponibles via `getFiltersBySubcategory()`
   - Parse des filtres depuis l'URL via `parseFiltersFromURL()`
   - Récupération des annonces filtrées

2. **Changement de filtre** :
   - Mise à jour de `selectedFilters`
   - Mise à jour de l'URL avec `updateURLWithFilters()`
   - Appel API pour récupérer les annonces filtrées

3. **Réinitialisation** :
   - Suppression de tous les filtres
   - Nettoyage de l'URL
   - Récupération des annonces sans filtres

## Fonctionnalités UX

### Desktop
- Sidebar fixe sur le côté gauche
- Filtres toujours visibles
- Application en temps réel

### Mobile
- Bouton "Filters" avec compteur de filtres actifs
- Modal plein écran pour les filtres
- Bouton "Apply Filters" pour fermer le modal

### Améliorations
- **Debounce** : 500ms pour les inputs text/number/range
- **Loading states** : Squelettes pendant le chargement des filtres
- **Badges actifs** : Affichage visuel des filtres appliqués avec possibilité de suppression
- **Compteur** : Nombre de filtres actifs affiché dans le header et le bouton mobile
- **Messages contextuels** : Messages différents si aucune annonce (avec ou sans filtres)
- **Synchronisation URL** : Partage d'URL avec filtres pré-appliqués

## Deep Linking

Le système supporte le deep linking : les filtres sont synchronisés avec l'URL.

**Exemple d'URL** :
```
/subcategory?subcategory=smartphones&filter_1=Rouge&filter_2_min=100000&filter_2_max=500000
```

Cette URL peut être partagée et restaurera automatiquement les filtres sélectionnés.

## Tests recommandés

1. ✅ Sélection d'un filtre simple met à jour les annonces
2. ✅ Sélection d'une plage fonctionne correctement
3. ✅ Combinaison de plusieurs filtres fonctionne
4. ✅ Réinitialisation des filtres charge toutes les annonces
5. ✅ Pagination conserve les filtres appliqués
6. ✅ URL reflète les filtres actifs
7. ✅ Partage d'une URL avec filtres pré-appliqués fonctionne
8. ✅ Vue mobile : filtres accessibles et fonctionnels
9. ✅ Debounce : pas d'appels API excessifs pour text/number/range
10. ✅ Navigation arrière du navigateur fonctionne correctement

## Notes importantes

- Toutes les annonces retournées par l'API ont déjà le statut `approved`
- Les filtres vides ou avec valeurs nulles sont automatiquement ignorés
- Le système est complètement dynamique et s'adapte aux filtres configurés dans le backend
- Les types de filtres non supportés sont ignorés avec un warning dans la console

## Exemple d'intégration

```jsx
import FilterSidebar from '../components/filters/FilterSidebar';
import ActiveFilterBadges from '../components/filters/ActiveFilterBadges';
import { buildFilterQueryParams, parseFiltersFromURL } from '../utils/filterHelpers';

// Dans votre composant
<FilterSidebar
  filters={filters}
  selectedFilters={selectedFilters}
  onChange={handleFilterChange}
  onReset={handleResetFilters}
  loading={filtersLoading}
/>

<ActiveFilterBadges
  filters={filters}
  selectedFilters={selectedFilters}
  onRemoveFilter={handleRemoveFilter}
/>
```

## Dépannage

### Les filtres ne s'affichent pas
- Vérifiez que l'API `/api/filters/by-subcategory/{slug}` retourne des données
- Vérifiez les logs de la console pour les erreurs

### Les annonces ne se filtrent pas
- Vérifiez que les query parameters sont correctement construits
- Vérifiez les logs de l'API backend
- Utilisez l'onglet Network pour inspecter les requêtes

### Le debounce ne fonctionne pas
- Vérifiez que le hook `useDebounce` est correctement importé
- Vérifiez que le délai est suffisant (500ms par défaut)

### L'URL ne se met pas à jour
- Vérifiez que `setSearchParams` est appelé dans `updateURLWithFilters()`
- Vérifiez que `useSearchParams` est importé depuis `react-router-dom`
