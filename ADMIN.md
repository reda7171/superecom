# Back-Office Admin - Documentation

## ✅ Fonctionnalités Implémentées

### 1. **Layout Admin** (`/admin/layout.tsx`)
- ✅ Sidebar latérale fixe avec navigation
- ✅ Menu avec icônes (Dashboard, Livres, Packs, Commandes, Clients)
- ✅ Section utilisateur avec email et bouton déconnexion
- ✅ Design moderne avec Tailwind CSS

### 2. **Dashboard** (`/admin`)
- ✅ Statistiques en temps réel :
  - Nombre de livres actifs
  - Nombre de packs actifs
  - Total des commandes
  - Chiffre d'affaires
- ✅ Tableau des commandes récentes
- ✅ Affichage des statuts avec couleurs

### 3. **Gestion des Livres** (`/admin/books`)

#### Page Liste
- ✅ Tableau avec toutes les informations (image, titre, auteur, catégorie, prix, stock)
- ✅ Statistiques : Total livres, Actifs, Stock total, Valeur stock
- ✅ Actions : Éditer, Supprimer, Activer/Désactiver
- ✅ Indicateur de stock (vert > 10, orange > 0, rouge = 0)

#### Formulaire d'Ajout (`/admin/books/new`)
- ✅ Champs : Titre, Auteur, ISBN, Prix, Stock, Catégorie, Image URL, Description
- ✅ Validation côté client et serveur (Zod)
- ✅ Gestion des erreurs avec messages clairs
- ✅ Sélecteur de catégorie prédéfini

### 4. **Gestion des Packs** (`/admin/packs`)

#### Page Liste
- ✅ Tableau avec informations (nom, livres inclus, prix, statut)
- ✅ Affichage des livres du pack (badges)
- ✅ Statistiques : Total packs, Packs actifs, Livres disponibles
- ✅ Actions : Éditer, Supprimer, Activer/Désactiver

#### Formulaire de Création (`/admin/packs/new`)
- ✅ Sélection multiple de livres avec checkboxes
- ✅ Calcul automatique du prix total des livres
- ✅ Résumé en temps réel (sidebar)
- ✅ Liste des livres sélectionnés
- ✅ Validation : minimum 1 livre requis

## 📁 Structure des Fichiers

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx              # Layout avec sidebar
│       ├── page.tsx                # Dashboard
│       ├── books/
│       │   ├── page.tsx            # Liste des livres
│       │   ├── BooksTable.tsx      # Table interactive
│       │   └── new/
│       │       └── page.tsx        # Formulaire ajout livre
│       └── packs/
│           ├── page.tsx            # Liste des packs
│           ├── PacksTable.tsx      # Table interactive
│           └── new/
│               ├── page.tsx        # Page wrapper
│               └── PackForm.tsx    # Formulaire création pack
├── lib/
│   ├── actions/
│   │   ├── books.ts                # Server Actions livres
│   │   ├── packs.ts                # Server Actions packs
│   │   └── orders.ts               # Server Actions commandes
│   └── db/
│       ├── books.ts                # Services livres
│       └── packs.ts                # Services packs
```

## 🎨 Design & UX

### Palette de Couleurs
- **Primaire**: Bleu (#3B82F6)
- **Succès**: Vert (#10B981)
- **Attention**: Orange (#F59E0B)
- **Danger**: Rouge (#EF4444)
- **Neutre**: Gris (#6B7280)

### Composants UI
- **Cartes de statistiques** avec icônes colorées
- **Tableaux** avec hover effects
- **Boutons** avec états (loading, disabled)
- **Formulaires** avec validation en temps réel
- **Badges** pour les statuts et catégories

### Responsive
- ✅ Sidebar fixe sur desktop
- ✅ Grid adaptatif pour les stats
- ✅ Tables avec scroll horizontal sur mobile

## 🔒 Sécurité

### Server Actions
- ✅ Validation Zod sur toutes les entrées
- ✅ Exécution côté serveur uniquement
- ✅ Gestion des erreurs complète
- ✅ Revalidation automatique des pages

### Validation
```typescript
// Exemple: Validation d'un livre
const BookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().min(1, 'L\'auteur est requis'),
  price: z.number().positive('Le prix doit être positif'),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  // ...
})
```

## 📊 Server Actions Disponibles

### Livres (`/lib/actions/books.ts`)
- `createBook(input)` - Créer un livre
- `updateBook(id, input)` - Mettre à jour un livre
- `deleteBook(id)` - Supprimer un livre
- `toggleBookStatus(id, active)` - Activer/Désactiver

### Packs (`/lib/actions/packs.ts`)
- `createPack(input)` - Créer un pack
- `updatePack(id, input)` - Mettre à jour un pack
- `deletePack(id)` - Supprimer un pack
- `togglePackStatus(id, active)` - Activer/Désactiver

### Commandes (`/lib/actions/orders.ts`)
- `createOrder(input)` - Créer une commande (transactionnel)
- `getOrderById(id)` - Récupérer une commande
- `updateOrderStatus(id, status)` - Changer le statut

## 🚀 Utilisation

### Démarrer l'application
```bash
npm run dev
```

### Accéder au back-office
```
http://localhost:3000/admin
```

### Ajouter un livre
1. Aller sur `/admin/books`
2. Cliquer sur "Ajouter un livre"
3. Remplir le formulaire
4. Cliquer sur "Enregistrer"

### Créer un pack
1. Aller sur `/admin/packs`
2. Cliquer sur "Créer un pack"
3. Sélectionner les livres (checkboxes)
4. Définir le nom et le prix
5. Cliquer sur "Créer le pack"

## 🎯 Prochaines Étapes

### Authentification
- [ ] Implémenter NextAuth.js
- [ ] Page de connexion `/admin/login`
- [ ] Middleware de protection des routes
- [ ] Gestion des sessions

### Fonctionnalités Manquantes
- [ ] Gestion des commandes (`/admin/orders`)
- [ ] Gestion des clients (`/admin/customers`)
- [ ] Formulaire d'édition des livres
- [ ] Formulaire d'édition des packs
- [ ] Upload d'images (au lieu d'URL)
- [ ] Filtres et recherche dans les tableaux
- [ ] Pagination
- [ ] Export CSV/Excel

### Améliorations UX
- [ ] Notifications toast au lieu d'alert()
- [ ] Confirmations modales stylisées
- [ ] Skeleton loaders
- [ ] Animations de transition
- [ ] Dark mode

## 📝 Notes Importantes

### Images
Pour l'instant, les images utilisent des URLs. Les chemins peuvent être :
- URL complète : `https://example.com/image.jpg`
- Chemin relatif : `/images/books/book.jpg`

Créez le dossier `public/images/books/` et `public/images/packs/` pour stocker les images localement.

### Données de Test
Utilisez Prisma Studio (http://localhost:51212) pour insérer des données de test ou exécutez le seed une fois qu'il fonctionne.

### Performance
- Server Components par défaut (pas de JS client inutile)
- Revalidation automatique après mutations
- Requêtes optimisées avec Prisma

## 🐛 Dépannage

### Erreur "Module not found"
```bash
npm install lucide-react
```

### Erreur Prisma Client
```bash
npx prisma generate
```

### Images ne s'affichent pas
Vérifiez que le chemin de l'image est correct et que le fichier existe dans `public/`.
