# Tests du Système de Filtrage

## Tests Unitaires des Fonctions Utilitaires

### Test de buildFilterQueryParams()

```javascript
import { buildFilterQueryParams } from '../src/utils/filterHelpers';

// Test 1 : Filtre simple
const test1 = buildFilterQueryParams({ 1: "Rouge" });
console.assert(test1.filter_1 === "Rouge", "Test 1 échoué");

// Test 2 : Filtre range
const test2 = buildFilterQueryParams({ 2: { min: 100000, max: 500000 } });
console.assert(test2.filter_2_min === 100000, "Test 2a échoué");
console.assert(test2.filter_2_max === 500000, "Test 2b échoué");

// Test 3 : Filtre range avec seulement min
const test3 = buildFilterQueryParams({ 2: { min: 100000 } });
console.assert(test3.filter_2_min === 100000, "Test 3a échoué");
console.assert(test3.filter_2_max === undefined, "Test 3b échoué");

// Test 4 : Filtre multiple (array)
const test4 = buildFilterQueryParams({ 3: ["Rouge", "Bleu"] });
console.assert(test4.filter_3 === "Rouge,Bleu", "Test 4 échoué");

// Test 5 : Combinaison de filtres
const test5 = buildFilterQueryParams({ 
  1: "Rouge", 
  2: { min: 100000, max: 500000 },
  3: ["XL", "L"]
});
console.assert(test5.filter_1 === "Rouge", "Test 5a échoué");
console.assert(test5.filter_2_min === 100000, "Test 5b échoué");
console.assert(test5.filter_2_max === 500000, "Test 5c échoué");
console.assert(test5.filter_3 === "XL,L", "Test 5d échoué");

// Test 6 : Valeurs vides (doivent être ignorées)
const test6 = buildFilterQueryParams({ 1: "", 2: null, 3: undefined });
console.assert(Object.keys(test6).length === 0, "Test 6 échoué");

console.log("✅ Tous les tests de buildFilterQueryParams() passent");
```

### Test de parseFiltersFromURL()

```javascript
import { parseFiltersFromURL } from '../src/utils/filterHelpers';

// Test 1 : Filtre simple
const params1 = new URLSearchParams("filter_1=Rouge");
const result1 = parseFiltersFromURL(params1);
console.assert(result1[1] === "Rouge", "Test 1 échoué");

// Test 2 : Filtre range
const params2 = new URLSearchParams("filter_2_min=100000&filter_2_max=500000");
const result2 = parseFiltersFromURL(params2);
console.assert(result2[2].min === "100000", "Test 2a échoué");
console.assert(result2[2].max === "500000", "Test 2b échoué");

// Test 3 : Filtre multiple
const params3 = new URLSearchParams("filter_3=Rouge,Bleu");
const result3 = parseFiltersFromURL(params3);
console.assert(Array.isArray(result3[3]), "Test 3a échoué");
console.assert(result3[3][0] === "Rouge", "Test 3b échoué");
console.assert(result3[3][1] === "Bleu", "Test 3c échoué");

// Test 4 : Combinaison
const params4 = new URLSearchParams("filter_1=Rouge&filter_2_min=100000&filter_2_max=500000&filter_3=XL,L");
const result4 = parseFiltersFromURL(params4);
console.assert(result4[1] === "Rouge", "Test 4a échoué");
console.assert(result4[2].min === "100000", "Test 4b échoué");
console.assert(result4[2].max === "500000", "Test 4c échoué");
console.assert(result4[3][0] === "XL", "Test 4d échoué");

console.log("✅ Tous les tests de parseFiltersFromURL() passent");
```

### Test de countActiveFilters()

```javascript
import { countActiveFilters } from '../src/utils/filterHelpers';

// Test 1 : Aucun filtre
console.assert(countActiveFilters({}) === 0, "Test 1 échoué");

// Test 2 : Un filtre simple
console.assert(countActiveFilters({ 1: "Rouge" }) === 1, "Test 2 échoué");

// Test 3 : Plusieurs filtres
console.assert(countActiveFilters({ 1: "Rouge", 2: { min: 100000 } }) === 2, "Test 3 échoué");

// Test 4 : Filtres avec valeurs vides (doivent être ignorés)
console.assert(countActiveFilters({ 1: "", 2: null, 3: "Valide" }) === 1, "Test 4 échoué");

console.log("✅ Tous les tests de countActiveFilters() passent");
```

## Tests d'Intégration

### Test 1 : Chargement de la Page

**Scénario** : L'utilisateur accède à `/subcategory?subcategory=smartphones`

**Attendu** :
1. Les filtres disponibles sont chargés depuis l'API
2. Les annonces de la sous-catégorie sont affichées
3. Aucun filtre n'est actif initialement

**Vérification** :
- [ ] Requête GET vers `/api/filters/by-subcategory/smartphones`
- [ ] Requête GET vers `/api/ads/subcategory/smartphones`
- [ ] Les filtres s'affichent dans la sidebar
- [ ] Les annonces s'affichent dans la grille

### Test 2 : Application d'un Filtre Simple

**Scénario** : L'utilisateur sélectionne "Rouge" dans le filtre "Couleur"

**Attendu** :
1. L'URL se met à jour : `?subcategory=smartphones&filter_1=Rouge`
2. Une requête API est envoyée avec le filtre
3. Les annonces sont mises à jour
4. Un badge "Couleur: Rouge" s'affiche

**Vérification** :
- [ ] URL mise à jour correctement
- [ ] Requête GET vers `/api/ads/subcategory/smartphones?filter_1=Rouge`
- [ ] Les annonces correspondent au filtre
- [ ] Le badge est visible et supprimable

### Test 3 : Application d'un Filtre Range

**Scénario** : L'utilisateur entre 100000 dans "Min" et 500000 dans "Max" pour le prix

**Attendu** :
1. Debounce de 500ms avant l'appel API
2. L'URL se met à jour : `?subcategory=smartphones&filter_2_min=100000&filter_2_max=500000`
3. Les annonces dans cette fourchette s'affichent
4. Un badge "Prix: Min: 100000, Max: 500000" s'affiche

**Vérification** :
- [ ] Pas d'appel API immédiat (debounce)
- [ ] Appel API après 500ms
- [ ] URL correcte
- [ ] Annonces filtrées
- [ ] Badge affiché

### Test 4 : Combinaison de Filtres

**Scénario** : L'utilisateur applique "Rouge" + Prix 100000-500000

**Attendu** :
1. Les deux filtres sont dans l'URL
2. Les annonces correspondent aux deux critères
3. Deux badges sont affichés

**Vérification** :
- [ ] URL : `?subcategory=smartphones&filter_1=Rouge&filter_2_min=100000&filter_2_max=500000`
- [ ] Requête avec les deux filtres
- [ ] Annonces correspondant aux deux critères
- [ ] Deux badges distincts

### Test 5 : Suppression d'un Filtre

**Scénario** : L'utilisateur clique sur le X d'un badge de filtre

**Attendu** :
1. Le filtre est supprimé de l'URL
2. Les autres filtres restent actifs
3. Les annonces sont mises à jour
4. Le badge disparaît

**Vérification** :
- [ ] Badge supprimé
- [ ] URL mise à jour
- [ ] Autres filtres conservés
- [ ] Annonces re-filtrées

### Test 6 : Réinitialisation de Tous les Filtres

**Scénario** : L'utilisateur clique sur "Reset"

**Attendu** :
1. Tous les filtres sont supprimés
2. L'URL ne contient que le paramètre subcategory
3. Toutes les annonces de la sous-catégorie s'affichent
4. Tous les badges disparaissent

**Vérification** :
- [ ] Tous les champs de filtre sont vides
- [ ] URL : `?subcategory=smartphones`
- [ ] Toutes les annonces affichées
- [ ] Aucun badge visible

### Test 7 : Deep Linking

**Scénario** : L'utilisateur accède directement à une URL avec filtres
`/subcategory?subcategory=smartphones&filter_1=Rouge&filter_2_min=100000&filter_2_max=500000`

**Attendu** :
1. Les filtres sont automatiquement appliqués
2. Les champs de filtre sont pré-remplis
3. Les annonces correspondent aux filtres
4. Les badges sont affichés

**Vérification** :
- [ ] Filtre "Couleur" = "Rouge"
- [ ] Filtre "Prix" Min = 100000, Max = 500000
- [ ] Annonces filtrées dès le chargement
- [ ] Badges affichés

### Test 8 : Vue Mobile

**Scénario** : L'utilisateur ouvre la page sur mobile et applique un filtre

**Attendu** :
1. La sidebar n'est pas visible
2. Un bouton "Filters" est affiché
3. Cliquer ouvre un modal
4. Les filtres fonctionnent dans le modal
5. "Apply Filters" ferme le modal

**Vérification** :
- [ ] Sidebar cachée sur mobile
- [ ] Bouton "Filters" visible
- [ ] Modal s'ouvre au clic
- [ ] Filtres fonctionnels
- [ ] Modal se ferme après application

### Test 9 : Aucune Annonce Trouvée

**Scénario** : Les filtres sélectionnés ne correspondent à aucune annonce

**Attendu** :
1. Message "No ads found"
2. Suggestion de réinitialiser les filtres
3. Bouton "Reset Filters"

**Vérification** :
- [ ] Message affiché
- [ ] Bouton "Reset Filters" présent
- [ ] Cliquer sur le bouton réinitialise les filtres

### Test 10 : Performance

**Scénario** : L'utilisateur tape rapidement dans un champ text

**Attendu** :
1. Pas d'appel API à chaque frappe
2. Un seul appel API après 500ms d'inactivité
3. Pas de lag dans l'interface

**Vérification** :
- [ ] Un seul appel API dans le Network tab
- [ ] Délai de 500ms respecté
- [ ] Interface fluide

## Checklist de Test Complet

### Fonctionnalités Core
- [ ] Chargement des filtres disponibles
- [ ] Chargement des annonces
- [ ] Application d'un filtre select
- [ ] Application d'un filtre radio
- [ ] Application d'un filtre checkbox
- [ ] Application d'un filtre text
- [ ] Application d'un filtre number
- [ ] Application d'un filtre range
- [ ] Combinaison de plusieurs filtres
- [ ] Suppression d'un filtre individuel
- [ ] Réinitialisation de tous les filtres

### URL et Deep Linking
- [ ] URL mise à jour avec les filtres
- [ ] Filtres parsés depuis l'URL au chargement
- [ ] Partage d'URL avec filtres fonctionne
- [ ] Navigation arrière/avant du navigateur

### UX
- [ ] Debounce fonctionne (500ms)
- [ ] Loading states affichés
- [ ] Badges de filtres actifs
- [ ] Compteur de filtres actifs
- [ ] Messages contextuels
- [ ] Vue mobile responsive
- [ ] Modal filtres sur mobile

### Performance
- [ ] Pas d'appels API excessifs
- [ ] Temps de réponse acceptable
- [ ] Pas de lag dans l'interface
- [ ] Pas de memory leaks

### Erreurs et Edge Cases
- [ ] Gestion des erreurs API
- [ ] Aucun filtre disponible
- [ ] Aucune annonce trouvée
- [ ] Sous-catégorie invalide
- [ ] Paramètres URL invalides

## Rapport de Test

### Date : __________

### Testeur : __________

### Environnement :
- Navigateur : __________
- Version : __________
- OS : __________

### Résultats :
- Tests passés : ____ / ____
- Tests échoués : ____ / ____
- Bugs trouvés : __________

### Bugs Identifiés :
1. __________
2. __________
3. __________

### Recommandations :
__________________________________________
__________________________________________
__________________________________________

### Conclusion :
☐ Prêt pour la production  
☐ Corrections nécessaires  
☐ Tests supplémentaires requis
