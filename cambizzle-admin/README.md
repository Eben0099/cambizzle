# Cambizzle Admin Dashboard

Tableau de bord administrateur moderne pour la plateforme marketplace Cambizzle.

## 🎯 Fonctionnalités

### Gestion des Utilisateurs
- Recherche et filtrage avancés
- Vérification d'identité (badge vendeur vérifié)
- Suspension et bannissement
- Gestion des rôles (acheteur, vendeur, admin)

### Modération des Annonces
- File d'attente de modération (statut pending)
- Approbation/rejet d'annonces
- Gestion des annonces premium
- Suivi des vues et statistiques

### Gestion des Référentiels
- **Catégories & Sous-catégories** : Hiérarchie complète avec compteurs
- **Filtres Dynamiques** : Champs personnalisés par sous-catégorie (dropdown, multi-select)
- **Marques** : Gestion des marques liées aux sous-catégories
- **Localisations** : Régions et villes

### Signalements
- Visualisation des signalements d'annonces et utilisateurs
- Système de priorités (urgent, moyen, faible)
- Actions de modération

### Statistiques
- Tableau de bord avec KPIs
- Activité récente
- Graphiques de performance

## 🎨 Design System

### Couleurs
- **Primary (Gold)** : #D6BA69 - Accent principal luxueux
- **Noir** : Interface sidebar et textes
- **Blanc** : Fond principal

### Structure
- Design responsive mobile-first
- Sidebar de navigation fixe
- Tables de données avec actions
- Modales pour les opérations CRUD

## 🛠️ Technologies

- **React 18** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants
- **React Router** pour la navigation

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

## 🗂️ Structure des Pages

```
/admin                    # Dashboard principal
/admin/users             # Gestion utilisateurs
/admin/ads               # Modération annonces
/admin/categories        # Catégories & sous-catégories
/admin/filters           # Filtres dynamiques
/admin/brands            # Gestion des marques
/admin/locations         # Régions et villes
/admin/reports           # Signalements
```

## 📊 Base de Données

Structure alignée sur le schéma MySQL fourni :
- `users` - Utilisateurs et rôles
- `ads` - Annonces avec modération
- `categories` / `subcategories` - Hiérarchie
- `filters` / `filter_values` - Champs dynamiques
- `brands` - Marques par sous-catégorie
- `locations` - Géolocalisation
- `reports` - Signalements

## 🔐 Sécurité

- Routes admin protégées
- Validation des données
- Gestion des rôles et permissions

## 📱 Responsive

Interface optimisée pour tous les écrans :
- Desktop : Sidebar + contenu
- Tablet : Navigation adaptée
- Mobile : Layout empilé

---

**Cambizzle** - Marketplace moderne pour l'Afrique
