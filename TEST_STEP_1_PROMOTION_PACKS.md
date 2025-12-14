# 🧪 Test Step 1: List Promotion Packs

## 📋 Objectif
Tester l'endpoint GET /api/promotion-packs pour récupérer et afficher la liste des packs de promotion disponibles.

## 🔧 Endpoint
```
GET /api/promotion-packs
```

## 📤 Headers
```
Authorization: Bearer {user_token}
```

## 📥 Réponse attendue
```json
[
  {
    "id": 1,
    "name": "Basic",
    "duration_days": 7,
    "price": 1000,
    "type": "boost",
    "is_active": 1,
    "description": "Boost your ad for 7 days",
    "features": "Top placement, Highlighted listing"
  },
  {
    "id": 2,
    "name": "Standard",
    "duration_days": 14,
    "price": 1800,
    "type": "boost",
    "is_active": 1,
    "description": "Boost your ad for 14 days",
    "features": "Top placement, Highlighted listing, Featured badge"
  }
]
```

## 🧪 Comment tester

### Méthode 1 : Via la page de test dédiée
1. Connectez-vous à l'application
2. Accédez à : http://localhost:5173/test/promotion-packs
3. La page charge automatiquement les packs
4. Vérifiez :
   - ✅ Les packs s'affichent correctement
   - ✅ Tous les champs sont présents (id, name, price, duration_days, etc.)
   - ✅ Le nombre de packs correspond à la base de données
   - ✅ Les packs actifs (is_active = 1) sont affichés

### Méthode 2 : Via le modal de boost
1. Connectez-vous à l'application
2. Allez dans votre profil > Mes annonces
3. Cliquez sur "Boost" sur une annonce
4. Le modal s'ouvre et charge les packs automatiquement
5. Vérifiez l'affichage des packs

### Méthode 3 : Via la console du navigateur
1. Ouvrez la console (F12)
2. Allez sur la page de test ou ouvrez le modal de boost
3. Recherchez les logs suivants :
   ```
   🔄 Step 1: Fetching promotion packs from API...
   ✅ Step 1 Complete: Promotion packs received: [...]
   📦 Extracted packs: [...]
   ✅ X promotion pack(s) loaded successfully
   ```

## ✅ Critères de succès

### API Response
- [ ] Code HTTP 200
- [ ] Body contient un tableau de packs
- [ ] Chaque pack a les champs requis : id, name, duration_days, price, type, is_active
- [ ] Au moins 1 pack avec is_active = 1

### UI Display
- [ ] Les packs sont affichés dans une grille responsive
- [ ] Chaque carte affiche : nom, prix, durée, type, statut
- [ ] Les packs actifs sont sélectionnables
- [ ] Le pack sélectionné a un style visuel distinct
- [ ] Les features sont affichées si présentes

### Console Logs
- [ ] Logs détaillés de l'appel API
- [ ] Raw response visible
- [ ] Extracted packs affichés
- [ ] Aucune erreur dans la console

## 🐛 Cas d'erreurs à tester

### 1. Pas de token d'authentification
**Action** : Déconnectez-vous et accédez à /test/promotion-packs
**Résultat attendu** : Erreur 401 Unauthorized

### 2. Token expiré
**Action** : Utilisez un token expiré
**Résultat attendu** : Erreur 401 avec message de reconnexion

### 3. Aucun pack disponible
**Action** : Backend retourne un tableau vide []
**Résultat attendu** : Message "No promotion packs available"

### 4. Erreur serveur
**Action** : Backend retourne 500
**Résultat attendu** : Message d'erreur avec bouton "Retry"

## 📊 Logs à vérifier

### Console du navigateur
```javascript
📦 Fetching promotion packs...
✅ Promotion packs retrieved: { data: [...] }
🔄 Step 1: Fetching promotion packs from API...
✅ Step 1 Complete: Promotion packs received: {...}
📦 Extracted packs: [...]
✅ 3 promotion pack(s) loaded successfully
```

### Network Tab (F12 > Network)
```
Request URL: http://localhost:8080/api/promotion-packs
Request Method: GET
Status Code: 200 OK
Response Headers:
  Content-Type: application/json
  Authorization: Bearer xxx...
```

## 🔄 Prochaine étape
Une fois l'étape 1 validée (liste des packs affichée correctement), on passe à l'étape 2 :
- **Step 2** : Sélection d'un pack et soumission du boost (POST /api/boost/boost-existing-ad/{ad_slug})

## 📝 Notes
- La page de test est accessible uniquement en mode développement
- Les logs détaillés sont activés pour faciliter le debug
- Le composant BoostAdModal utilise le même service boostService.js
- Les packs inactifs (is_active = 0) sont affichés mais peuvent être grisés dans une future version
