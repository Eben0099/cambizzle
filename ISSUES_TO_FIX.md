# Cambizzle - Liste des Problèmes à Corriger

**Date:** 2024-12-23
**Status:** En cours de correction

---

## Légende

- ✅ Corrigé
- 🔄 En cours
- ❌ À corriger
- ⏭️ Reporté
- 🚫 N/A (n'existe pas ou déjà fait)

---

## 🔴 PRIORITÉ 1 - CRITIQUE

### 1. Recherche ne fonctionne pas
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend + Backend |
| **Status** | 🔄 PARTIELLEMENT CORRIGÉ |
| **Problème** | Les critères de recherche ne fonctionnent pas correctement |
| **Corrections appliquées** | - ✅ Pagination implémentée (state `currentPage`, handlers `handlePageChange`)<br>- ✅ URL sync avec paramètre `page`<br>- ✅ Scroll to top après changement de page |
| **Reste à faire** | - Location filter utilise match exact<br>- Structure de données entre endpoints |
| **Fichiers modifiés** | `src/pages/Search.jsx` |

---

## 🔴 PRIORITÉ 2 - BACKEND

### 2. Delete category ne fonctionne pas
| Aspect | Détails |
|--------|---------|
| **Type** | Backend |
| **Status** | ✅ CODE CORRECT |
| **Problème** | Erreur lors de la suppression d'une catégorie |
| **Analyse** | Le code backend est correct. L'erreur vient probablement de: catégorie contenant des sous-catégories (bloque la suppression) ou problème frontend |
| **Fichiers Backend** | `app/Controllers/Api/AdminReferentialController.php` |

### 3. Report ad - pas de notification
| Aspect | Détails |
|--------|---------|
| **Type** | Backend |
| **Status** | ⚠️ GÉNÈRE LIEN SEULEMENT |
| **Problème** | Après signalement, aucune notification email/WhatsApp n'est envoyée |
| **Analyse** | Le système génère un lien WhatsApp mais n'envoie pas de notification réelle. Pour de vraies notifications: intégrer service email ou API Twilio/WhatsApp Business |
| **Fichiers Backend** | `app/Controllers/Api/ReportController.php`, `app/Services/ReportService.php` |

### 4. Total views et favourites non affichés
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend |
| **Status** | ✅ CORRIGÉ |
| **Problème** | Les statistiques de vues et favoris ne s'affichaient pas (mismatch snake_case/camelCase) |
| **Solution appliquée** | Ajouté transformation dans `useProfileQuery.js` pour mapper `view_count` → `viewCount` et autres champs |
| **Fichiers modifiés** | `src/hooks/useProfileQuery.js` |

---

## 🟠 PRIORITÉ 3 - BUGS CRITIQUES

### 5. User verified sans ID uploadé
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend + Backend |
| **Status** | ✅ CORRIGÉ |
| **Problème** | Le badge "verified" utilise `isVerified` (email) au lieu de `isIdentityVerified` (document ID) |
| **Fichiers modifiés** | - Frontend: `ProfileHeader.jsx`, `AdDetail.jsx`, `AdCard.jsx`<br>- Backend: `AdsController.php` |
| **Solution appliquée** | - Frontend: Utiliser `isIdentityVerified` au lieu de `isVerified`<br>- Backend: Retourner `userIdentityVerified` depuis `users.is_identity_verified` |

### 6. Cannot access "my ads" from ad details
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend |
| **Status** | ✅ CORRIGÉ |
| **Problème** | Impossible d'accéder à mes annonces depuis la page de détails |
| **Solution appliquée** | - Ajouté détection `isOwner` pour identifier si l'utilisateur est le propriétaire<br>- Ajouté section "Owner Actions" avec boutons "Edit" et "My Ads"<br>- Ajouté traduction `common.you` |
| **Fichiers modifiés** | `src/pages/AdDetail.jsx`, `src/i18n/locales/en.json`, `src/i18n/locales/fr.json` |

### 7. Edit ad - validation error (selling price)
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend |
| **Status** | ✅ CORRIGÉ |
| **Problème** | Le prix de vente est copié dans le prix original causant une erreur de validation |
| **Solution appliquée** | - Au chargement: ne remplir `originalPrice` que si > `price`<br>- À la soumission: gérer correctement le cas où pas de remise |
| **Fichiers modifiés** | `src/pages/UpdateAd.jsx` |

### 8. Washing Machine - champs obligatoires incorrects
| Aspect | Détails |
|--------|---------|
| **Type** | Backend |
| **Status** | ❌ À corriger |
| **Problème** | La sous-catégorie "Washing Machine" a des champs "burners" et "type" obligatoires qui ne devraient pas l'être |
| **Solution** | Corriger la configuration des filtres dans la base de données |

### 9. Category tree shows generic filters
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend |
| **Status** | ❌ À corriger |
| **Problème** | Quand on clique sur l'arbre de catégories depuis la page de détails, des filtres génériques s'affichent au lieu des filtres spécifiques à la catégorie |
| **Fichiers** | `src/pages/Search.jsx`, `src/components/filters/FilterSidebar.jsx` |

---

## 🟡 PRIORITÉ 4 - PAGES MANQUANTES

### 10. Forgot Password page manquante
| Aspect | Détails |
|--------|---------|
| **Type** | Frontend |
| **Status** | ✅ CORRIGÉ |
| **Problème** | Le lien "Forgot Password" existe dans Login.jsx:168-173 mais la page n'existait pas |
| **API** | Endpoint `auth/reset-password` utilisé (flux simplifié : téléphone + nouveau mot de passe) |
| **Solution appliquée** | - Créé `src/pages/ForgotPassword.jsx`<br>- Ajouté route `/forgot-password` dans `App.jsx`<br>- Ajouté traductions en.json et fr.json |

---

## 🟢 PRIORITÉ 5 - UI/UX FRONTEND

### 11. "Posted on Cambizzle" taille inconsistante
| Aspect | Détails |
|--------|---------|
| **Status** | 🚫 N/A |
| **Note** | Ce texte n'existe pas dans le code actuel |
| **Fichiers** | `src/components/ads/AdCard.jsx` |

### 12. Edit ad - Photos existantes non affichées
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/pages/UpdateAd.jsx` |

### 13. Images not resized properly
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/components/ui/ImageUpload.jsx` |

### 14. Brand field affiché 2 fois
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/pages/CreateAd.jsx`, `src/pages/UpdateAd.jsx` |

### 15. Multi-select ne fonctionne pas sur mobile
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | L'utilisateur doit sélectionner un par un au lieu de multi-select |
| **Fichiers** | `src/components/filters/FilterSidebar.jsx` |

### 16. White square sur mobile (login/signup)
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/pages/Login.jsx`, `src/pages/Register.jsx` |

### 17. White block bloquant les ads sur mobile
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Un bloc blanc bloque les annonces lors du scroll sur mobile |
| **Fichiers** | `src/components/layout/Header.jsx` |

### 18. Subcategory display mal sur mobile
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Quand on clique sur une catégorie, les sous-catégories s'affichent mal en dessous |
| **Fichiers** | `src/components/layout/CategorySidebar.jsx` |

### 19. Texte squeezé sur landing page mobile
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Prix, location, date mal alignés sur une ligne |
| **Fichiers** | `src/components/ads/AdCard.jsx` |

### 20. WhatsApp icon à droite du téléphone
| Aspect | Détails |
|--------|---------|
| **Status** | ✅ CORRIGÉ |
| **Solution appliquée** | Icône WhatsApp intégrée à côté du numéro de téléphone |
| **Fichiers modifiés** | `src/components/adDetail/SellerProfile.jsx` |

### 21. Remove "Continue with Facebook"
| Aspect | Détails |
|--------|---------|
| **Status** | 🚫 Déjà commenté |
| **Fichiers** | `src/components/auth/AuthModal.jsx:650-659` |

### 22. Buttons Next/Previous mal positionnés
| Aspect | Détails |
|--------|---------|
| **Status** | ✅ DÉJÀ CORRECT |
| **Note** | Les boutons sont déjà positionnés correctement: Previous à gauche, Next à droite |
| **Fichiers** | `src/pages/CreateAd.jsx` |

### 23. "Drag to Reorder" → "Hold and Drag to Reorder"
| Aspect | Détails |
|--------|---------|
| **Status** | ✅ DÉJÀ CORRIGÉ |
| **Note** | Le texte est déjà "Hold and Drag to Reorder" dans les fichiers de traduction |
| **Fichiers** | `src/i18n/locales/en.json`, `src/i18n/locales/fr.json` |

### 24. Location = ville pas région
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Afficher la ville/town au lieu de la région |
| **Fichiers** | `src/pages/CreateAd.jsx`, composants d'affichage |

### 25. Verified badge mal positionné + afficher sur landing
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/components/adDetail/SellerProfile.jsx`, `src/components/ads/AdCard.jsx` |

### 26. Valeurs non traduites en français
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Certaines valeurs dynamiques ne sont pas traduites |
| **Fichiers** | `src/i18n/locales/fr.json`, Weglot config |

### 27. Pop-up doit avoir les labels
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Les modals doivent afficher les labels (location, category, etc.) |
| **Fichiers** | Divers composants Modal |

### 28. Mobile Dashboard menu - icon couvre texte
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | L'icône du menu couvre le texte, le header CAMBIZZLE devrait être sur chaque écran |
| **Fichiers** | `src/components/admin/AdminLayout.jsx` |

### 29. Terms start at 13,14 instead of 1,2,3
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | Page Terms and Conditions |

### 30. About/Terms/Safety tips collapsibles
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Ces sections devraient être des accordéons collapsibles |
| **Fichiers** | Footer pages |

### 31. Admin menu mobile améliorations
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | - Clic sur menu item doit afficher immédiatement les détails<br>- Icône de fermeture à droite<br>- Retirer "Cambizzle" en haut |
| **Fichiers** | `src/components/admin/AdminLayout.jsx` |

### 32. Mobile Login screen overlapping
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/pages/Login.jsx` |

### 33. My favorites blank
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | La page favoris est vide, rien ne s'affiche |
| **Fichiers** | `src/components/profile/ProfileFavorites.jsx` |

### 34. Pages loading from bottom/footer
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Chaque page charge depuis le bas/footer au lieu du haut |
| **Fichiers** | Layout/routing components |

### 35. iOS drag to reorder not working
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Le drag-and-drop utilise HTML5 qui ne fonctionne pas sur touch/iOS |
| **Fichiers** | `src/components/ui/ImageUpload.jsx` |

### 36. Black menu bar across content on mobile
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/components/layout/Header.jsx` |

### 37. "Publish" button rename + position
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Problème** | Renommer en "Publish" et mettre à droite, même taille que Next/Previous |
| **Fichiers** | `src/pages/CreateAd.jsx` |

### 38. Search field should not have text/icon
| Aspect | Détails |
|--------|---------|
| **Status** | ❌ |
| **Fichiers** | `src/pages/Search.jsx` ou Header |

---

## ✅ DÉJÀ RÉSOLU

| # | Problème | Notes |
|---|----------|-------|
| - | Remove Ad Type "Service" | N'existe pas dans le code (seulement "sell" et "rent") |
| - | Remove "Continue with Facebook" | Déjà commenté dans AuthModal.jsx:650-659 |

---

## Notes Techniques

### API Backend
- Repository: `C:\tmp\claude\tasks\cambizzle-api`
- Framework: CodeIgniter 4
- Password Reset endpoints existent: `auth/forgot-password`, `auth/reset-password`

### Frontend
- Repository: `C:\Users\Admin\Downloads\cambizzle\cambizzle`
- Framework: React + Vite
- i18n: react-i18next + Weglot

---

## Historique des Corrections

| Date | Issue # | Description | Fichiers modifiés |
|------|---------|-------------|-------------------|
| 2024-12-23 | #5 | User verified badge | ProfileHeader.jsx, AdDetail.jsx, AdCard.jsx, AdsController.php |
| 2024-12-23 | #1 | Search pagination | Search.jsx |
| 2024-12-23 | #10 | ForgotPassword page | ForgotPassword.jsx, App.jsx, en.json, fr.json |
| 2024-12-23 | #6 | Access my ads from ad details | AdDetail.jsx, en.json, fr.json |
| 2024-12-23 | #7 | Edit ad price validation | UpdateAd.jsx |
| 2024-12-23 | #20 | WhatsApp icon positioning | SellerProfile.jsx |
| 2024-12-23 | #4 | Total views display fix | useProfileQuery.js |

