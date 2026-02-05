# Schéma Prisma - Plateforme Riwaya

## ✅ Schéma Complet Défini

Le fichier `schema.prisma` a été créé avec succès avec les spécifications suivantes :

### 📊 Enums

#### UserRole
```prisma
enum UserRole {
  ADMIN
  MANAGER
}
```

#### OrderStatus
```prisma
enum OrderStatus {
  PENDING      // En attente
  CONFIRMED    // Confirmée
  SHIPPED      // En livraison
  DELIVERED    // Livrée
  CANCELLED    // Annulée
}
```

#### OrderItemType
```prisma
enum OrderItemType {
  BOOK  // Livre
  PACK  // Pack de livres
}
```

### 📋 Modèles de Données

#### 1. User (Administrateur)
- **id**: UUID (clé primaire)
- **email**: String unique
- **password**: String (hashé avec bcrypt)
- **role**: UserRole (ADMIN ou MANAGER)
- **createdAt**: DateTime
- **updatedAt**: DateTime

**Table**: `users`

#### 2. Book (Livre)
- **id**: UUID (clé primaire)
- **title**: String (255 caractères)
- **author**: String (255 caractères)
- **description**: Text
- **isbn**: String unique optionnel (20 caractères)
- **price**: Double
- **stock**: Int (défaut: 0)
- **image**: String (500 caractères)
- **category**: String optionnel (100 caractères)
- **active**: Boolean (défaut: true)
- **createdAt**: DateTime
- **updatedAt**: DateTime

**Relations**:
- `packBooks`: PackBook[] (livres dans les packs)
- `orderItems`: OrderItem[] (livres commandés)

**Index**: category, active

**Table**: `books`

#### 3. Pack (Offre Groupée)
- **id**: UUID (clé primaire)
- **name**: String (255 caractères)
- **description**: Text optionnel
- **price**: Double
- **image**: String optionnel (500 caractères)
- **active**: Boolean (défaut: true)
- **createdAt**: DateTime
- **updatedAt**: DateTime

**Relations**:
- `books`: PackBook[] (livres du pack)
- `orderItems`: OrderItem[] (packs commandés)

**Index**: active

**Table**: `packs`

#### 4. PackBook (Liaison Pack-Book)
- **id**: UUID (clé primaire)
- **packId**: String (FK vers Pack)
- **bookId**: String (FK vers Book)

**Relations**:
- `pack`: Pack (onDelete: Cascade)
- `book`: Book (onDelete: Cascade)

**Contraintes**: Unique sur [packId, bookId]

**Index**: packId, bookId

**Table**: `pack_books`

#### 5. Order (Commande COD)
- **id**: UUID (clé primaire)
- **fullName**: String (255 caractères)
- **phone**: String (20 caractères)
- **address**: String (500 caractères)
- **city**: String (100 caractères)
- **comment**: Text optionnel
- **total**: Double
- **status**: OrderStatus (défaut: PENDING)
- **createdAt**: DateTime
- **updatedAt**: DateTime

**Relations**:
- `items`: OrderItem[] (lignes de commande)

**Index**: status, createdAt, phone

**Table**: `orders`

#### 6. OrderItem (Ligne de Commande)
- **id**: UUID (clé primaire)
- **orderId**: String (FK vers Order)
- **type**: OrderItemType (BOOK ou PACK)
- **quantity**: Int (défaut: 1)
- **price**: Double (prix au moment de l'achat)
- **bookId**: String optionnel (FK vers Book)
- **packId**: String optionnel (FK vers Pack)

**Relations**:
- `order`: Order (onDelete: Cascade)
- `book`: Book optionnel (onDelete: SetNull)
- `pack`: Pack optionnel (onDelete: SetNull)

**Index**: orderId, bookId, packId

**Table**: `order_items`

**Note**: Un seul des champs `bookId` ou `packId` sera rempli selon le `type`.

## 🔄 Relations

### Many-to-Many
- **Pack ↔ Book** via `PackBook`
  - Un pack contient plusieurs livres
  - Un livre peut appartenir à plusieurs packs

### One-to-Many
- **Order → OrderItem**
  - Une commande contient plusieurs lignes
  
- **Book → OrderItem**
  - Un livre peut être dans plusieurs commandes
  
- **Pack → OrderItem**
  - Un pack peut être dans plusieurs commandes

## 🎯 Optimisations

### Index Créés
- `books`: category, active
- `packs`: active
- `pack_books`: packId, bookId
- `orders`: status, createdAt, phone
- `order_items`: orderId, bookId, packId

### Contraintes
- Email unique pour User
- ISBN unique pour Book
- Combinaison [packId, bookId] unique pour PackBook

### Cascade Deletes
- Suppression d'un Pack → supprime les PackBook associés
- Suppression d'un Book → supprime les PackBook associés
- Suppression d'une Order → supprime les OrderItem associés

### Soft Deletes (via SetNull)
- Suppression d'un Book/Pack → les OrderItem gardent le prix mais perdent la référence

## ✅ Validation

```bash
npx prisma validate
# ✅ The schema at prisma\schema.prisma is valid 🚀
```

## 🔄 Base de Données Synchronisée

```bash
npx prisma db push --force-reset
# ✅ Database reset and synchronized
```

```bash
npx prisma generate
# ✅ Prisma Client generated successfully
```

## 📝 Exemple d'Utilisation

### Créer un Admin
```typescript
const admin = await prisma.user.create({
  data: {
    email: 'admin@riwaya.com',
    password: await bcrypt.hash('password', 10),
    role: 'ADMIN'
  }
})
```

### Créer un Livre
```typescript
const book = await prisma.book.create({
  data: {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'Guide pratique...',
    price: 150,
    stock: 50,
    image: '/images/books/atomic-habits.jpg',
    category: 'Développement personnel'
  }
})
```

### Créer un Pack avec Livres
```typescript
const pack = await prisma.pack.create({
  data: {
    name: 'Pack Développement Personnel',
    price: 450,
    image: '/images/packs/dev-perso.jpg',
    books: {
      create: [
        { bookId: book1.id },
        { bookId: book2.id },
        { bookId: book3.id }
      ]
    }
  }
})
```

### Créer une Commande
```typescript
const order = await prisma.order.create({
  data: {
    fullName: 'Ahmed Benali',
    phone: '0612345678',
    address: '123 Rue Mohammed V',
    city: 'Casablanca',
    total: 150,
    status: 'PENDING',
    items: {
      create: [
        {
          type: 'BOOK',
          bookId: book.id,
          quantity: 1,
          price: 150
        }
      ]
    }
  }
})
```

## 🚀 Prochaines Étapes

1. ✅ Schéma Prisma défini et validé
2. ✅ Base de données synchronisée
3. ✅ Client Prisma généré
4. [ ] Créer les données de seed manuellement (via Prisma Studio)
5. [ ] Créer les API Routes Next.js
6. [ ] Implémenter l'authentification
7. [ ] Créer les composants frontend
