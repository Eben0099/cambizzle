# Guide de Démarrage Rapide - Système de Filtrage

## 🚀 Démarrage en 3 étapes

### Étape 1 : Vérifier que le backend est configuré

Le backend doit exposer ces deux endpoints :

1. **GET `/api/filters/by-subcategory/{subcategorySlug}`**
   - Retourne les filtres disponibles pour une sous-catégorie

2. **GET `/api/ads/subcategory/{subcategorySlug}`**
   - Accepte les query parameters `filter_{id}`, `filter_{id}_min`, `filter_{id}_max`
   - Retourne les annonces filtrées

### Étape 2 : Accéder à une sous-catégorie

Naviguez vers une URL de sous-catégorie :
```
http://localhost:5173/subcategory?subcategory=smartphones
```

### Étape 3 : Utiliser les filtres

**Desktop** :
- Les filtres s'affichent automatiquement dans la sidebar à gauche
- Sélectionnez des valeurs → Les annonces se mettent à jour automatiquement

**Mobile** :
- Cliquez sur le bouton "Filters"
- Sélectionnez vos filtres dans le modal
- Cliquez sur "Apply Filters"

## 🎯 Exemples d'Utilisation

### Exemple 1 : Filtre simple (couleur)
1. Sélectionnez "Rouge" dans le filtre "Couleur"
2. L'URL devient : `?subcategory=smartphones&filter_1=Rouge`
3. Les annonces rouges s'affichent

### Exemple 2 : Filtre range (prix)
1. Entrez 100000 dans "Min" et 500000 dans "Max"
2. Attendez 500ms (debounce)
3. L'URL devient : `?subcategory=smartphones&filter_2_min=100000&filter_2_max=500000`
4. Les annonces dans cette fourchette s'affichent

### Exemple 3 : Combinaison de filtres
1. Sélectionnez "Rouge" + Prix 100000-500000
2. L'URL devient : `?subcategory=smartphones&filter_1=Rouge&filter_2_min=100000&filter_2_max=500000`
3. Les annonces correspondant aux deux critères s'affichent

### Exemple 4 : Réinitialisation
1. Cliquez sur "Reset" dans le header de la sidebar
2. Tous les filtres sont supprimés
3. Toutes les annonces de la sous-catégorie s'affichent

### Exemple 5 : Partage d'URL
1. Copiez l'URL avec les filtres actifs
2. Partagez-la avec quelqu'un
3. En ouvrant l'URL, les filtres sont automatiquement appliqués

## 🔍 Débugger

### Voir les requêtes API
1. Ouvrez les DevTools (F12)
2. Onglet "Network"
3. Filtrez par "ads" ou "filters"
4. Observez les requêtes et leurs paramètres

### Voir les logs
Ouvrez la console (F12) et cherchez :
- `🔧 Récupération des filtres pour:` → Chargement des filtres
- `🔄 Changement de filtre:` → Modification d'un filtre
- `📊 DÉBUT - Récupération des annonces` → Appel API pour les annonces
- `✅ SUCCÈS - Annonces de sous-catégorie chargées:` → Annonces reçues

### Problèmes courants

#### Les filtres ne s'affichent pas
```javascript
// Vérifier dans la console
// Rechercher : "✅ Filtres chargés:"
// Si erreur : "❌ Erreur récupération filtres:"
```

**Solution** : Vérifier que l'API backend est accessible et retourne des données valides.

#### Les annonces ne se mettent pas à jour
```javascript
// Vérifier dans la console
// Rechercher : "🔗 Paramètres de requête:"
// Vérifier que les paramètres sont corrects
```

**Solution** : Vérifier que les query parameters sont correctement construits et que l'API les accepte.

#### Le debounce ne fonctionne pas
- Tapez rapidement dans un champ text/number/range
- Il ne devrait y avoir qu'un seul appel API après 500ms

**Solution** : Vérifier que le hook `useDebounce` est bien importé dans le composant.

## 📱 Tester sur Mobile

1. Ouvrez les DevTools (F12)
2. Activez le mode responsive (Ctrl+Shift+M)
3. Sélectionnez un appareil mobile
4. Le bouton "Filters" devrait apparaître
5. Cliquez dessus pour ouvrir le modal

## 🎨 Personnalisation

### Changer les couleurs
Éditez les classes Tailwind dans les composants :
- `bg-[#D6BA69]` → Couleur primaire (doré)
- `text-[#D6BA69]` → Texte doré
- `border-[#D6BA69]` → Bordure dorée

### Changer le délai du debounce
Éditez les composants FilterText, FilterNumber, FilterRange :
```javascript
const debouncedOnChange = useDebounce((newValue) => {
  onChange(filter.id, newValue);
}, 500); // Changez 500 par la valeur souhaitée en ms
```

### Ajouter un nouveau type de filtre
1. Créez un nouveau composant dans `src/components/filters/`
2. Ajoutez le case dans `FilterSidebar.jsx` :
```javascript
case 'mon-nouveau-type':
  return <MonNouveauFiltre filter={filter} value={value} onChange={onChange} />;
```

## 📊 Surveiller les Performances

### Dans le Network Tab
- Nombre de requêtes vers `/api/ads/subcategory/...`
- Temps de réponse de chaque requête
- Taille des données transférées

### Dans la Console
- Temps de chargement des filtres
- Temps de chargement des annonces
- Nombre d'appels API

**Objectif** : 
- 1 appel pour les filtres au chargement
- 1 appel pour les annonces par changement de filtre (après debounce pour text/number/range)

## ✅ Checklist de Test

Avant de considérer que tout fonctionne :

- [ ] Les filtres se chargent correctement
- [ ] Chaque type de filtre fonctionne (select, radio, checkbox, text, number, range)
- [ ] Les annonces se mettent à jour lors du changement de filtre
- [ ] Le debounce fonctionne (500ms pour text/number/range)
- [ ] Les badges de filtres actifs s'affichent
- [ ] La suppression individuelle de filtres fonctionne
- [ ] Le bouton "Reset" supprime tous les filtres
- [ ] L'URL se met à jour avec les filtres
- [ ] Le partage d'URL avec filtres fonctionne
- [ ] La vue mobile fonctionne (modal)
- [ ] Le message "No ads found" s'affiche si aucune annonce
- [ ] Le message propose de réinitialiser les filtres si actifs
- [ ] Aucune erreur dans la console
- [ ] Les performances sont bonnes (pas de lag)

## 🎓 Ressources

- **Documentation complète** : Voir `FILTERING_SYSTEM_README.md`
- **Résumé d'implémentation** : Voir `FILTERING_IMPLEMENTATION_SUMMARY.md`
- **Code source** : Voir les fichiers dans `src/components/filters/`

## 💡 Astuces

1. **Testez d'abord avec un seul filtre** pour vérifier que tout fonctionne
2. **Utilisez la console** pour voir les logs détaillés
3. **Utilisez le Network tab** pour voir les requêtes API
4. **Partagez les URLs** pour tester le deep linking
5. **Testez sur mobile** pour vérifier la responsivité

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console
2. Vérifiez le Network tab pour les erreurs API
3. Consultez la documentation complète
4. Vérifiez que le backend retourne les bonnes données

Bonne utilisation ! 🚀
