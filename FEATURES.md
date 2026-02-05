# 🚀 Fonctionnalités à Développer - Riwaya

## ✅ Déjà Implémenté

### Backend
- [x] Schéma Prisma complet (User, Book, Pack, Order, OrderItem, PackBook)
- [x] Services de base de données (books.ts, packs.ts)
- [x] Server Actions pour livres (CRUD complet)
- [x] Server Actions pour packs (CRUD complet)
- [x] Server Actions pour commandes (création transactionnelle)
- [x] Server Actions pour authentification
- [x] Middleware de protection des routes admin

### Admin
- [x] Layout avec sidebar et navigation
- [x] Page de connexion sécurisée
- [x] Dashboard avec statistiques
- [x] Gestion des livres (liste, ajout, édition, suppression)
- [x] Gestion des packs (liste, création avec sélection multiple)
- [x] Déconnexion fonctionnelle

### Frontend Client
- [x] Page d'accueil avec hero et sections
- [x] Catalogue de livres avec filtres et recherche
- [x] Header et footer
- [x] Design responsive

---

## 🎯 Fonctionnalités Prioritaires à Développer

### 1. **Panier d'Achat** (Priorité: HAUTE)

#### Store Zustand
```typescript
// src/store/cart.ts
interface CartItem {
  type: 'BOOK' | 'PACK'
  productId: string
  title: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}
```

#### Composants Nécessaires
- [ ] `CartProvider` - Context provider
- [ ] `CartButton` - Bouton panier avec badge
- [ ] `CartDrawer` - Sidebar panier
- [ ] `CartItem` - Item du panier
- [ ] `AddToCartButton` - Bouton ajouter au panier

#### Pages
- [ ] `/cart` - Page panier complète

---

### 2. **Pages Détails Produits** (Priorité: HAUTE)

#### Page Détail Livre (`/books/[id]`)
Composants :
- [ ] Galerie d'images (ou image principale)
- [ ] Informations du livre (titre, auteur, description, ISBN)
- [ ] Prix et stock
- [ ] Bouton "Ajouter au panier"
- [ ] Catégorie et badge
- [ ] Livres similaires (même catégorie)

#### Page Détail Pack (`/packs/[id]`)
Composants :
- [ ] Image du pack
- [ ] Nom et description
- [ ] Liste des livres inclus (avec images miniatures)
- [ ] Prix du pack vs prix total des livres
- [ ] Badge "ÉCONOMIE"
- [ ] Bouton "Ajouter au panier"

---

### 3. **Processus de Commande (Checkout)** (Priorité: HAUTE)

#### Page Checkout (`/checkout`)
Sections :
- [ ] Résumé de la commande
- [ ] Formulaire client :
  - Nom complet
  - Téléphone
  - Adresse de livraison
  - Ville (sélecteur)
  - Commentaire optionnel
- [ ] Récapitulatif des frais :
  - Sous-total
  - Frais de livraison
  - Total
- [ ] Bouton "Confirmer la commande"

#### Page Confirmation (`/orders/[id]/confirmation`)
- [ ] Message de succès
- [ ] Numéro de commande
- [ ] Récapitulatif de la commande
- [ ] Informations de livraison
- [ ] Bouton "Retour à l'accueil"

---

### 4. **Admin - Gestion des Commandes** (Priorité: MOYENNE)

#### Liste des Commandes (`/admin/orders`)
- [ ] Tableau avec toutes les commandes
- [ ] Filtres :
  - Par statut (En attente, Confirmée, En livraison, Livrée, Annulée)
  - Par date
  - Par ville
- [ ] Recherche par nom/téléphone
- [ ] Actions rapides (changer statut)
- [ ] Statistiques (commandes du jour, en attente, CA du mois)

#### Détail Commande (`/admin/orders/[id]`)
- [ ] Informations client
- [ ] Liste des produits commandés
- [ ] Adresse de livraison
- [ ] Statut avec timeline
- [ ] Boutons de changement de statut
- [ ] Historique des changements
- [ ] Bouton "Imprimer bon de livraison"

---

### 5. **Admin - Gestion des Clients** (Priorité: BASSE)

#### Liste des Clients (`/admin/customers`)
- [ ] Tableau des clients (nom, téléphone, ville, nb commandes)
- [ ] Recherche
- [ ] Tri par nombre de commandes
- [ ] Statistiques (total clients, clients actifs)

#### Détail Client
- [ ] Informations du client
- [ ] Historique des commandes
- [ ] Total dépensé
- [ ] Dernière commande

---

### 6. **Améliorations UX** (Priorité: MOYENNE)

#### Notifications
- [ ] Remplacer `alert()` par des toasts (react-hot-toast ou sonner)
- [ ] Notifications de succès/erreur stylisées
- [ ] Notifications de confirmation

#### Modales
- [ ] Modale de confirmation de suppression
- [ ] Modale de détails rapides (quick view)
- [ ] Modale de connexion (optionnel)

#### Loading States
- [ ] Skeleton loaders pour les listes
- [ ] Spinners pour les boutons
- [ ] Progress bar pour les uploads

---

### 7. **Upload d'Images** (Priorité: MOYENNE)

#### Composant Upload
- [ ] Drag & drop
- [ ] Prévisualisation
- [ ] Validation (taille, format)
- [ ] Upload vers `/public/images/` ou service cloud

#### Intégration
- [ ] Formulaire ajout livre
- [ ] Formulaire ajout pack
- [ ] Édition de produits

---

### 8. **Envoi d'Emails** (Priorité: MOYENNE)

#### Configuration SMTP
```typescript
// src/lib/email.ts
- Configuration Nodemailer
- Templates d'emails
```

#### Emails à Envoyer
- [ ] Confirmation de commande (client)
- [ ] Notification nouvelle commande (admin)
- [ ] Changement de statut (client)
- [ ] Livraison confirmée (client)

---

### 9. **Page Packs Client** (`/packs`) (Priorité: HAUTE)

Similaire à `/books` mais pour les packs :
- [ ] Grille de packs
- [ ] Filtres (nombre de livres, prix)
- [ ] Tri (prix, popularité)
- [ ] Badge "ÉCONOMIE X MAD"

---

### 10. **Fonctionnalités Avancées** (Priorité: BASSE)

#### Recherche Globale
- [ ] Barre de recherche dans le header
- [ ] Recherche dans livres ET packs
- [ ] Suggestions en temps réel
- [ ] Page de résultats

#### Wishlist
- [ ] Bouton "Ajouter aux favoris"
- [ ] Page favoris
- [ ] Persistance (localStorage ou DB)

#### Avis Clients
- [ ] Système de notation (étoiles)
- [ ] Commentaires
- [ ] Modération admin

#### Codes Promo
- [ ] Création de codes promo (admin)
- [ ] Application au checkout
- [ ] Validation et calcul de réduction

#### Analytics
- [ ] Dashboard analytics (admin)
- [ ] Graphiques de ventes
- [ ] Produits les plus vendus
- [ ] Évolution du CA

---

## 📋 Ordre de Développement Recommandé

### Phase 1 : Expérience Client de Base
1. ✅ Store Zustand pour le panier
2. ✅ Composant AddToCartButton
3. ✅ Page panier (`/cart`)
4. ✅ Page détail livre (`/books/[id]`)
5. ✅ Page détail pack (`/packs/[id]`)
6. ✅ Page packs (`/packs`)

### Phase 2 : Processus de Commande
7. ✅ Page checkout (`/checkout`)
8. ✅ Intégration Server Action createOrder
9. ✅ Page confirmation
10. ✅ Notifications toast

### Phase 3 : Admin Complet
11. ✅ Gestion des commandes (liste)
12. ✅ Détail commande
13. ✅ Changement de statut
14. ✅ Formulaires d'édition (livres, packs)

### Phase 4 : Améliorations
15. ✅ Upload d'images
16. ✅ Envoi d'emails
17. ✅ Pagination
18. ✅ Recherche globale

### Phase 5 : Fonctionnalités Avancées
19. ✅ Codes promo
20. ✅ Analytics
21. ✅ Avis clients

---

## 🎨 Suggestions de Design

### Panier
- Drawer qui slide depuis la droite
- Animation smooth
- Badge avec nombre d'items
- Mini-résumé dans le header

### Checkout
- Formulaire en une seule page (pas de multi-step)
- Validation en temps réel
- Récapitulatif sticky à droite
- Bouton CTA bien visible

### Notifications
- Position : top-right
- Auto-dismiss après 3-5 secondes
- Icônes selon le type (✓, ✗, ⓘ)
- Animations d'entrée/sortie

---

## 💡 Brainstorming - Idées Supplémentaires

### Gamification
- [ ] Points de fidélité
- [ ] Badges pour clients réguliers
- [ ] Réductions progressives

### Marketing
- [ ] Newsletter
- [ ] Blog/Articles
- [ ] Recommandations personnalisées
- [ ] "Clients ont aussi acheté..."

### Mobile
- [ ] Application mobile (React Native)
- [ ] PWA (Progressive Web App)
- [ ] Notifications push

### Logistique
- [ ] Intégration transporteur
- [ ] Tracking de livraison
- [ ] Gestion des retours

---

**Prochaine action recommandée** : Commencer par le **Store Zustand** et le **panier** pour permettre aux clients d'ajouter des produits et passer commande.
