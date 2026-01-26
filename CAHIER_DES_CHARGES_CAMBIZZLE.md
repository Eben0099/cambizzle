# CAHIER DES CHARGES
## CAMBIZZLE - Plateforme de Petites Annonces au Cameroun

---

**Version:** 1.0
**Date:** Janvier 2026
**Statut:** Document Final

---

## TABLE DES MATIÈRES

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Objectifs](#2-objectifs)
3. [Périmètre Fonctionnel](#3-périmètre-fonctionnel)
4. [Architecture Technique](#4-architecture-technique)
5. [Spécifications Fonctionnelles Détaillées](#5-spécifications-fonctionnelles-détaillées)
6. [Interface Utilisateur](#6-interface-utilisateur)
7. [Sécurité](#7-sécurité)
8. [Performance](#8-performance)
9. [Intégrations Externes](#9-intégrations-externes)
10. [Annexes](#10-annexes)

---

## 1. PRÉSENTATION DU PROJET

### 1.1 Contexte

**Cambizzle** est une plateforme de petites annonces en ligne dédiée au marché camerounais. Elle permet aux utilisateurs d'acheter et de vendre des biens et services de manière simple, sécurisée et efficace.

### 1.2 Vision

*"Sell Faster. Buy Better in Cameroon."*

Devenir la référence incontournable des petites annonces au Cameroun en offrant une expérience utilisateur fluide, moderne et adaptée aux réalités locales.

### 1.3 Public Cible

| Segment | Description |
|---------|-------------|
| **Particuliers** | Utilisateurs souhaitant vendre ou acheter des biens d'occasion |
| **Professionnels** | Commerçants, entreprises et prestataires de services |
| **Administrateurs** | Équipe de modération et gestion de la plateforme |

### 1.4 Proposition de Valeur

- Interface intuitive et moderne
- Paiement mobile intégré (Mobile Money)
- Support multilingue (Français/Anglais)
- Système de boost pour une meilleure visibilité
- Vérification des vendeurs pour plus de confiance
- Filtres avancés et recherche intelligente

---

## 2. OBJECTIFS

### 2.1 Objectifs Stratégiques

| Objectif | Indicateur de Succès |
|----------|---------------------|
| Acquisition utilisateurs | 10 000 utilisateurs inscrits en 6 mois |
| Engagement | 50% des utilisateurs publient au moins 1 annonce |
| Monétisation | 20% des annonces utilisent le service de boost |
| Satisfaction | Note moyenne de 4.5/5 sur les feedbacks |

### 2.2 Objectifs Techniques

- **Disponibilité** : 99.5% uptime
- **Performance** : Temps de chargement < 3 secondes
- **Scalabilité** : Support de 100 000 utilisateurs simultanés
- **Sécurité** : Conformité aux standards OWASP

---

## 3. PÉRIMÈTRE FONCTIONNEL

### 3.1 Vue d'Ensemble des Modules

```
┌─────────────────────────────────────────────────────────────┐
│                      CAMBIZZLE                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Module    │  │   Module    │  │   Module    │         │
│  │ Utilisateur │  │  Annonces   │  │  Paiement   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Module    │  │   Module    │  │   Module    │         │
│  │  Recherche  │  │    Admin    │  │     CMS     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Cartographie des Fonctionnalités

#### Module Utilisateur
- ✅ Inscription (email/téléphone)
- ✅ Connexion (email/téléphone + mot de passe)
- ✅ Connexion sociale (Google OAuth)
- ✅ Réinitialisation mot de passe
- ✅ Gestion du profil
- ✅ Profil vendeur/business
- ✅ Vérification d'identité
- ✅ Gestion des favoris

#### Module Annonces
- ✅ Création d'annonce (multi-étapes)
- ✅ Modification d'annonce
- ✅ Suppression d'annonce
- ✅ Upload d'images multiples
- ✅ Catégorisation dynamique
- ✅ Filtres personnalisés par sous-catégorie
- ✅ Système de boost/promotion
- ✅ Feedbacks et évaluations

#### Module Recherche
- ✅ Recherche par mots-clés
- ✅ Filtrage par catégorie/sous-catégorie
- ✅ Filtrage par prix
- ✅ Filtrage par localisation
- ✅ Filtres dynamiques
- ✅ Tri (récent, prix, popularité)
- ✅ Pagination
- ✅ Vue grille/liste

#### Module Paiement
- ✅ Intégration Campay (Mobile Money)
- ✅ MTN Mobile Money
- ✅ Orange Money
- ✅ Suivi du statut de paiement
- ✅ Historique des transactions

#### Module Administration
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des utilisateurs
- ✅ Modération des annonces
- ✅ Gestion des catégories/sous-catégories
- ✅ Gestion des filtres
- ✅ Gestion des marques
- ✅ Gestion des localisations
- ✅ Gestion des signalements
- ✅ Gestion des packs de promotion
- ✅ Suivi des paiements
- ✅ Logs de modération
- ✅ Codes de parrainage

#### Module CMS
- ✅ Page À propos
- ✅ Conditions d'utilisation
- ✅ Conseils de sécurité
- ✅ FAQ
- ✅ Informations de contact
- ✅ Liens réseaux sociaux

---

## 4. ARCHITECTURE TECHNIQUE

### 4.1 Stack Technologique

#### Frontend
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| React | 18+ | Framework UI |
| Vite | 5+ | Build tool |
| Tailwind CSS | 3+ | Stylisation |
| React Query | 5+ | Gestion d'état serveur |
| React Router | 6+ | Navigation |
| Axios | 1+ | Client HTTP |
| React i18next | - | Internationalisation |
| Lucide React | - | Icônes |
| Recharts | - | Graphiques |

#### Backend (API)
| Technologie | Utilisation |
|-------------|-------------|
| API RESTful | Communication client-serveur |
| JWT | Authentification |
| Cloudflare | CDN et protection |

### 4.2 Architecture Applicative

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Pages   │  │Components│  │ Contexts │  │  Hooks   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                          │                                    │
│                    ┌─────▼─────┐                             │
│                    │ Services  │                             │
│                    └─────┬─────┘                             │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTPS/REST
┌──────────────────────────▼───────────────────────────────────┐
│                      BACKEND (API)                            │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │   Ads    │  │  Admin   │  │ Payment  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Structure du Projet Frontend

```
src/
├── components/
│   ├── admin/           # Composants admin
│   ├── ads/             # Composants annonces
│   ├── adDetail/        # Composants détail annonce
│   ├── categories/      # Composants catégories
│   ├── filters/         # Composants filtres
│   ├── layout/          # Header, Footer, Sidebar
│   ├── profile/         # Composants profil
│   ├── seller/          # Composants vendeur
│   ├── toast/           # Notifications
│   └── ui/              # Composants UI réutilisables
├── config/
│   └── api.js           # Configuration API
├── contexts/
│   ├── AuthContext.jsx  # État authentification
│   ├── AdsContext.jsx   # État annonces
│   └── SettingsContext.jsx # État paramètres
├── hooks/               # Hooks personnalisés
├── i18n/
│   └── locales/         # Fichiers de traduction
├── pages/
│   ├── admin/           # Pages administration
│   └── ...              # Pages publiques
├── services/            # Services API
└── utils/               # Utilitaires
```

---

## 5. SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES

### 5.1 Module Authentification

#### 5.1.1 Inscription

**Description:** Permet à un nouvel utilisateur de créer un compte.

**Champs requis:**
| Champ | Type | Validation |
|-------|------|------------|
| Prénom | Texte | Requis, 2-50 caractères |
| Nom | Texte | Requis, 2-50 caractères |
| Email | Email | Requis, format email valide |
| Téléphone | Téléphone | Requis, format camerounais |
| Mot de passe | Password | Requis, min 8 caractères |
| Confirmation | Password | Doit correspondre au mot de passe |

**Flux:**
1. Utilisateur remplit le formulaire
2. Validation côté client
3. Envoi à l'API `/auth/register`
4. Création du compte
5. Connexion automatique
6. Redirection vers l'accueil

#### 5.1.2 Connexion

**Description:** Permet à un utilisateur existant de se connecter.

**Méthodes de connexion:**
- Email + Mot de passe
- Téléphone + Mot de passe
- Google OAuth

**Flux:**
1. Utilisateur saisit ses identifiants
2. Envoi à l'API `/auth/login`
3. Réception du token JWT
4. Stockage du token en localStorage
5. Chargement des données utilisateur
6. Redirection

#### 5.1.3 Réinitialisation de Mot de Passe

**Flux:**
1. Utilisateur clique sur "Mot de passe oublié"
2. Saisie de l'email/téléphone
3. Envoi d'un lien/code de réinitialisation
4. Création du nouveau mot de passe
5. Confirmation et redirection vers connexion

---

### 5.2 Module Annonces

#### 5.2.1 Création d'Annonce

**Description:** Processus multi-étapes pour publier une annonce.

**Étape 1 - Catégorie:**
- Sélection de la catégorie principale
- Sélection de la sous-catégorie
- Chargement dynamique des sous-catégories

**Étape 2 - Informations:**
| Champ | Type | Requis |
|-------|------|--------|
| Titre | Texte | Oui |
| Description | Textarea | Oui |
| Prix | Nombre | Oui |
| Prix original | Nombre | Non |
| Négociable | Boolean | Non |
| Type (Vente/Location) | Select | Oui |
| Localisation | Select | Oui |
| Marque | Select | Si applicable |

**Étape 3 - Filtres Dynamiques:**
- Champs personnalisés selon la sous-catégorie
- Types supportés: Select, Multiselect, Texte, Nombre, Date, Boolean

**Étape 4 - Images:**
- Upload multiple (jusqu'à 10 images)
- Prévisualisation
- Réorganisation par drag & drop
- Suppression individuelle
- Formats supportés: JPG, PNG, WebP

**Étape 5 - Plan de Boost (Optionnel):**
- Affichage des packs de promotion disponibles
- Sélection du pack
- Initiation du paiement si sélectionné

**Étape 6 - Confirmation:**
- Récapitulatif de l'annonce
- Validation finale
- Soumission pour modération

#### 5.2.2 Gestion des Annonces

**Fonctionnalités:**
- Liste des annonces de l'utilisateur
- Statuts: En attente, Approuvée, Rejetée
- Modification de l'annonce
- Suppression de l'annonce
- Statistiques (vues, favoris)
- Boost d'une annonce existante

#### 5.2.3 Détail d'Annonce

**Éléments affichés:**
- Carrousel d'images avec zoom
- Titre et description
- Prix (avec remise si applicable)
- Localisation
- Date de publication
- Nombre de vues
- Caractéristiques (filtres)
- Tags

**Informations vendeur:**
- Nom et photo
- Membre depuis
- Note moyenne
- Badge de vérification
- Boutons de contact (Message, Appel)

**Fonctionnalités:**
- Partage de l'annonce
- Ajout aux favoris
- Signalement
- Annonces similaires
- Feedbacks/Avis

---

### 5.3 Module Recherche et Filtrage

#### 5.3.1 Recherche

**Types de recherche:**
- Recherche globale (barre de recherche)
- Recherche par catégorie
- Recherche par sous-catégorie
- Recherche avec filtres combinés

**Paramètres de recherche:**
| Paramètre | Type | Description |
|-----------|------|-------------|
| q | String | Mots-clés de recherche |
| category | String | Slug de la catégorie |
| subcategory | String | Slug de la sous-catégorie |
| priceMin | Number | Prix minimum |
| priceMax | Number | Prix maximum |
| location | String | Localisation |
| sort | String | Critère de tri |
| page | Number | Numéro de page |

#### 5.3.2 Filtres Dynamiques

**Types de filtres:**
| Type | Composant | Exemple |
|------|-----------|---------|
| Select | Dropdown | Marque |
| Multiselect | Checkboxes | Couleurs |
| Text | Input texte | Modèle |
| Number | Input numérique | Année |
| Boolean | Toggle | Négociable |
| Date | Date picker | Date limite |
| Range | Slider | Fourchette de prix |

**Comportement:**
- Filtres chargés dynamiquement par sous-catégorie
- Persistance dans l'URL
- Badges des filtres actifs
- Réinitialisation individuelle ou globale

#### 5.3.3 Affichage des Résultats

**Options d'affichage:**
- Vue grille (2 colonnes mobile, 4 colonnes desktop)
- Vue liste

**Tri:**
- Plus récent
- Prix croissant
- Prix décroissant
- Plus populaire

**Pagination:**
- 50 annonces par page
- Navigation par numéros de page
- Boutons Précédent/Suivant

---

### 5.4 Module Paiement et Boost

#### 5.4.1 Packs de Promotion

**Structure d'un pack:**
| Attribut | Description |
|----------|-------------|
| Nom | Nom commercial du pack |
| Prix | Prix en FCFA |
| Durée | Durée en jours |
| Description | Avantages inclus |

**Exemple de packs:**
- Pack Basic: 1 000 FCFA - 7 jours
- Pack Standard: 2 500 FCFA - 15 jours
- Pack Premium: 5 000 FCFA - 30 jours

#### 5.4.2 Flux de Paiement

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE PAIEMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Sélection du pack                                        │
│           │                                                  │
│           ▼                                                  │
│  2. Saisie du numéro de téléphone                           │
│           │                                                  │
│           ▼                                                  │
│  3. Choix du mode de paiement (MTN/Orange)                  │
│           │                                                  │
│           ▼                                                  │
│  4. Initiation du paiement (API Campay)                     │
│           │                                                  │
│           ▼                                                  │
│  5. Affichage modal de statut                               │
│           │                                                  │
│           ▼                                                  │
│  6. Polling du statut (toutes les 5 secondes)               │
│           │                                                  │
│     ┌─────┴─────┐                                           │
│     ▼           ▼                                           │
│  Succès      Échec                                          │
│     │           │                                           │
│     ▼           ▼                                           │
│  Activation   Message                                       │
│  du boost     d'erreur                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5.4.3 Méthodes de Paiement

| Méthode | Code | Description |
|---------|------|-------------|
| MTN Mobile Money | mtn_mobile_money | Paiement via MTN MoMo |
| Orange Money | orange_money | Paiement via Orange Money |

---

### 5.5 Module Administration

#### 5.5.1 Tableau de Bord

**Statistiques affichées:**
- Nombre total d'utilisateurs
- Nouveaux utilisateurs (semaine)
- Utilisateurs vérifiés
- Nombre total d'annonces
- Annonces en attente
- Nombre de signalements
- Revenus totaux
- Transactions récentes

**Graphiques:**
- Évolution des inscriptions
- Évolution des annonces
- Répartition des paiements

#### 5.5.2 Gestion des Utilisateurs

**Fonctionnalités:**
| Action | Description |
|--------|-------------|
| Lister | Afficher tous les utilisateurs avec pagination |
| Rechercher | Recherche par nom, email, téléphone |
| Filtrer | Par statut, rôle, vérification |
| Suspendre | Désactiver un compte avec raison |
| Réactiver | Réactiver un compte suspendu |
| Vérifier | Valider l'identité d'un utilisateur |
| Modifier rôle | Changer le rôle (user, admin) |
| Exporter | Export Excel de la liste |

**Documents de vérification:**
- Visualisation des pièces d'identité
- Viewer PDF intégré
- Approbation/Rejet de la vérification

#### 5.5.3 Modération des Annonces

**Workflow de modération:**
```
Nouvelle annonce → En attente → Approuvée/Rejetée
```

**Actions disponibles:**
| Action | Description |
|--------|-------------|
| Approuver | Valider et publier l'annonce |
| Rejeter | Refuser avec motif |
| Supprimer | Supprimer définitivement |
| Masquer | Rendre invisible temporairement |

**Filtres de modération:**
- Statut (en attente, approuvé, rejeté)
- Catégorie
- Date de création
- Utilisateur

#### 5.5.4 Gestion des Catégories

**Structure:**
```
Catégorie
├── Nom
├── Slug
├── Icône
├── Ordre d'affichage
├── Statut (actif/inactif)
└── Sous-catégories
    ├── Nom
    ├── Slug
    ├── Statut
    └── Filtres associés
```

**Opérations:**
- Créer/Modifier/Supprimer catégories
- Créer/Modifier/Supprimer sous-catégories
- Upload d'icônes
- Réorganisation de l'ordre

#### 5.5.5 Gestion des Filtres

**Types de filtres configurables:**
| Type | Description | Exemple |
|------|-------------|---------|
| select | Liste déroulante | Marque |
| multiselect | Sélection multiple | Couleurs |
| text | Champ texte | Modèle |
| number | Champ numérique | Année |
| boolean | Oui/Non | Négociable |
| date | Sélecteur de date | Date limite |

**Configuration d'un filtre:**
- Nom du filtre
- Type
- Sous-catégorie associée
- Options (pour select/multiselect)
- Ordre d'affichage
- Requis ou optionnel

#### 5.5.6 Gestion des Signalements

**Types de signalements:**
- Annonce inappropriée
- Spam
- Fraude
- Contenu dupliqué
- Autre

**Traitement:**
- Visualisation du signalement
- Détails de l'annonce/utilisateur signalé
- Résolution avec notes
- Contact du signaleur

#### 5.5.7 Paramètres CMS

**Sections éditables:**
| Section | Description |
|---------|-------------|
| À propos | Présentation de la plateforme |
| Conditions | Conditions générales d'utilisation |
| Sécurité | Conseils de sécurité |
| FAQ | Questions fréquentes |
| Contact | Informations de contact |
| Réseaux sociaux | Liens Facebook, Twitter, Instagram |

---

### 5.6 Module Profil Utilisateur

#### 5.6.1 Onglets du Profil

**Vue d'ensemble:**
- Informations personnelles
- Statistiques (annonces, vues, favoris)
- Activité récente

**Mes Annonces:**
- Liste des annonces publiées
- Filtrage par statut
- Actions rapides (modifier, supprimer, booster)
- Statistiques par annonce

**Favoris:**
- Liste des annonces favorites
- Suppression des favoris
- Accès rapide aux détails

**Business (Profil Vendeur):**
- Nom de la boutique
- Description
- Logo
- Statut de vérification

**Paramètres:**
- Modification des informations personnelles
- Changement de mot de passe
- Photo de profil
- Suppression de compte

---

## 6. INTERFACE UTILISATEUR

### 6.1 Principes de Design

| Principe | Application |
|----------|-------------|
| Mobile First | Design responsive partant du mobile |
| Minimalisme | Interface épurée et claire |
| Cohérence | Utilisation constante des composants |
| Accessibilité | Labels ARIA, contraste suffisant |
| Feedback | Retours visuels sur les actions |

### 6.2 Charte Graphique

**Couleurs principales:**
| Couleur | Code | Utilisation |
|---------|------|-------------|
| Or/Doré | #D6BA69 | Couleur principale, CTA |
| Or foncé | #C5A952 | Hover states |
| Noir | #000000 | Texte principal |
| Gris clair | #F9FAFB | Arrière-plans |
| Blanc | #FFFFFF | Cartes, conteneurs |

**Typographie:**
- Police principale: System fonts (Inter, SF Pro, etc.)
- Titres: Bold/Black
- Corps: Regular
- Tailles responsives

### 6.3 Composants UI

**Composants de base:**
- Button (primary, outline, ghost)
- Input (text, email, password, tel)
- Select (dropdown, multiselect)
- Card
- Modal/Dialog
- Toast/Notification
- Badge
- Avatar
- Loader
- Pagination

**Composants métier:**
- AdCard (carte d'annonce)
- ImageCarousel
- FilterSidebar
- CategoryGrid
- SellerProfile
- PaymentModal

### 6.4 Responsive Breakpoints

| Breakpoint | Largeur | Cible |
|------------|---------|-------|
| Mobile | < 640px | Smartphones |
| SM | 640px | Petites tablettes |
| MD | 768px | Tablettes |
| LG | 1024px | Petits laptops |
| XL | 1280px | Desktop |
| 2XL | 1536px | Grands écrans |

---

## 7. SÉCURITÉ

### 7.1 Authentification

| Mesure | Description |
|--------|-------------|
| JWT | Tokens signés avec expiration |
| HTTPS | Chiffrement des communications |
| Password Hashing | Hashage côté serveur |
| Session | Gestion des sessions avec timeout |

### 7.2 Autorisation

**Rôles:**
| Rôle | Permissions |
|------|-------------|
| User | Créer/gérer ses annonces, favoris |
| Seller | User + profil business |
| Admin | Accès complet à l'administration |

### 7.3 Protection des Données

- Validation des entrées côté client et serveur
- Sanitization des données
- Protection CSRF
- Rate limiting sur les API
- Logs d'audit des actions admin

### 7.4 Gestion des Fichiers

- Validation des types de fichiers (images uniquement)
- Limitation de taille des uploads
- Stockage sécurisé des fichiers
- URLs signées pour les documents sensibles

---

## 8. PERFORMANCE

### 8.1 Optimisations Frontend

| Technique | Description |
|-----------|-------------|
| Code Splitting | Chargement à la demande |
| Lazy Loading | Images et composants |
| Caching | React Query avec staleTime |
| Debouncing | Recherche avec délai |
| Memoization | Optimisation des re-renders |

### 8.2 Configuration du Cache

| Donnée | Durée de cache |
|--------|----------------|
| Annonces | 5 minutes |
| Détail annonce | 10 minutes |
| Catégories | 30 minutes |
| Données de création | 30 minutes |
| Filtres | 30 minutes |

### 8.3 Métriques Cibles

| Métrique | Objectif |
|----------|----------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |

---

## 9. INTÉGRATIONS EXTERNES

### 9.1 Campay (Paiement Mobile)

**Fonctionnalités:**
- Initiation de paiement Mobile Money
- Vérification du statut de paiement
- Support MTN et Orange Money

**Endpoints utilisés:**
| Endpoint | Description |
|----------|-------------|
| POST /boost/boost-existing-ad/:slug | Initier paiement |
| GET /boost/check-payment/:id | Vérifier statut |

### 9.2 Google OAuth

**Fonctionnalités:**
- Connexion avec compte Google
- Récupération des informations profil

### 9.3 Weglot (Traduction)

**Fonctionnalités:**
- Traduction automatique du contenu
- Support français/anglais
- Traduction des contenus dynamiques

### 9.4 Cloudflare

**Fonctionnalités:**
- CDN pour les assets
- Protection DDoS
- Gestion des sessions
- Heartbeat toutes les 15 minutes

---

## 10. ANNEXES

### 10.1 Glossaire

| Terme | Définition |
|-------|------------|
| Annonce | Publication d'un bien ou service à vendre/louer |
| Boost | Promotion payante pour une meilleure visibilité |
| Catégorie | Classification principale des annonces |
| Sous-catégorie | Classification secondaire |
| Filtre | Critère de recherche spécifique |
| Favori | Annonce sauvegardée par un utilisateur |
| Slug | Identifiant URL-friendly |

### 10.2 Liste des API Endpoints

#### Authentification
```
POST   /auth/login
POST   /auth/register
POST   /auth/forgot-password
GET    /auth/me
PUT    /auth/profile
POST   /auth/change-password
```

#### Annonces
```
GET    /ads
GET    /ads/:slug
POST   /ads
POST   /ads/:slug (update)
DELETE /ads/:id
GET    /ads/category/:categoryId
GET    /ads/subcategory/:subcategorySlug
GET    /ads/creation-data
```

#### Filtres et Catégories
```
GET    /categories
GET    /categories/:id/subcategories
GET    /subcategories/:slug/fields
GET    /filters/by-subcategory/:slug
GET    /locations
GET    /brands
```

#### Favoris
```
POST   /favorite/ads/:adId
DELETE /favorite/ads/:adId
GET    /favorite/ads/:adId
GET    /favorite/ads
```

#### Paiement et Boost
```
GET    /promotion-packs
POST   /boost/boost-existing-ad/:slug
GET    /boost/check-payment/:paymentId
```

#### Administration
```
GET    /admin/users
POST   /admin/users/:id/suspend
POST   /admin/users/:id/unsuspend
POST   /admin/users/:id/verify-identity
GET    /admin/ads
GET    /admin/ads/pending
POST   /admin/ads/:id/approve
POST   /admin/ads/:id/reject
GET    /admin/reports
POST   /admin/reports/:id/resolve
GET    /admin/moderation-logs
GET    /admin/referral-codes
GET    /admin/reporting/payments-stats
GET    /admin/reporting/payments
GET    /admin/settings
PUT    /admin/settings
```

### 10.3 Diagramme de Base de Données (Conceptuel)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Users     │     │    Ads      │     │ Categories  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │────<│ userId      │     │ id          │
│ email       │     │ categoryId  │>────│ name        │
│ phone       │     │ subcatId    │     │ slug        │
│ firstName   │     │ title       │     │ icon        │
│ lastName    │     │ description │     │ order       │
│ password    │     │ price       │     └─────────────┘
│ role        │     │ status      │            │
│ isVerified  │     │ isBoosted   │            │
└─────────────┘     └─────────────┘     ┌──────▼──────┐
       │                   │            │Subcategories│
       │            ┌──────▼──────┐     ├─────────────┤
       │            │  AdPhotos   │     │ id          │
       │            ├─────────────┤     │ categoryId  │
       │            │ id          │     │ name        │
       │            │ adId        │     │ slug        │
       │            │ url         │     └─────────────┘
       │            └─────────────┘            │
       │                                       │
┌──────▼──────┐     ┌─────────────┐     ┌──────▼──────┐
│  Favorites  │     │  Payments   │     │   Filters   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ userId      │     │ id          │     │ id          │
│ adId        │     │ userId      │     │ subcatId    │
│ createdAt   │     │ adId        │     │ name        │
└─────────────┘     │ amount      │     │ type        │
                    │ status      │     │ options     │
                    │ method      │     └─────────────┘
                    └─────────────┘
```

---

## HISTORIQUE DES VERSIONS

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | Janvier 2026 | Équipe Cambizzle | Version initiale |

---

**Document rédigé par:** Équipe Technique Cambizzle
**Contact:** contact@cambizzle.com
**Site web:** https://cambizzle.com
