# Backend - Services et Server Actions

## ✅ Fichiers Créés

### 1. Script de Seed (`prisma/seed.ts`)
- ✅ 1 Admin par défaut (email: `admin@riwaya.com`, password: `admin123`)
- ✅ 10 Livres réalistes avec catégories variées
- ✅ 3 Packs exemples :
  - Pack Développement Personnel (3 livres)
  - Pack Business & Entrepreneuriat (3 livres)
  - Pack Productivité & Performance (2 livres)

**Note**: Le seed TypeScript rencontre un problème avec Prisma 7. **Solution** : Utiliser Prisma Studio (déjà ouvert sur http://localhost:51212) pour insérer les données manuellement.

### 2. Services de Base de Données

#### `src/lib/db/books.ts`
Fonctions pour la gestion des livres :
- `getBooks(filters?)` - Liste avec filtres (catégorie, prix, recherche)
- `getBookById(id)` - Récupération par ID
- `getBookCategories()` - Liste des catégories uniques
- `getPopularBooks(limit)` - Livres populaires
- `checkBookAvailability(bookId, quantity)` - Vérification du stock

#### `src/lib/db/packs.ts`
Fonctions pour la gestion des packs :
- `getPacks()` - Liste tous les packs actifs avec leurs livres
- `getPackById(id)` - Récupération par ID avec livres
- `getPopularPacks(limit)` - Packs populaires
- `checkPackAvailability(packId, quantity)` - Vérification du stock

### 3. Server Actions (`src/lib/actions/orders.ts`)

#### `createOrder(input)`
**Server Action transactionnelle** pour créer une commande :

**Fonctionnalités** :
- ✅ Validation des données avec Zod
- ✅ Vérification de la disponibilité des produits
- ✅ Création de la commande et des items
- ✅ **Décrémentation automatique du stock** (transactionnel)
- ✅ Gestion des erreurs complète
- ✅ Revalidation des pages concernées

**Schéma de validation** :
```typescript
{
  fullName: string (min 3 caractères),
  phone: string (format: 0[5-7]XXXXXXXX),
  address: string (min 10 caractères),
  city: string (min 2 caractères),
  comment?: string,
  items: Array<{
    type: 'BOOK' | 'PACK',
    productId: string (UUID),
    quantity: number (> 0),
    price: number (> 0)
  }>
}
```

**Retour** :
```typescript
| { success: true, orderId: string }
| { success: false, error: string }
```

#### `getOrderById(orderId)`
Récupère une commande avec tous ses détails (items, livres, packs).

#### `updateOrderStatus(orderId, status)`
Met à jour le statut d'une commande (Admin).

## 📝 Exemple d'Utilisation

### Dans un Server Component
```typescript
import { getBooks } from '@/lib/db/books'
import { getPacks } from '@/lib/db/packs'

export default async function HomePage() {
  const books = await getBooks({ active: true })
  const packs = await getPacks()
  
  return (
    <div>
      {/* Afficher les livres et packs */}
    </div>
  )
}
```

### Dans un Client Component avec Server Action
```typescript
'use client'

import { createOrder } from '@/lib/actions/orders'
import { useState } from 'react'

export function CheckoutForm() {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    const result = await createOrder({
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      items: [
        {
          type: 'BOOK',
          productId: 'book-uuid',
          quantity: 1,
          price: 150
        }
      ]
    })
    
    if (result.success) {
      // Rediriger vers la page de confirmation
      window.location.href = `/orders/${result.orderId}/confirmation`
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }
  
  return <form action={handleSubmit}>...</form>
}
```

## 🔒 Sécurité Implémentée

- ✅ Validation Zod sur toutes les entrées
- ✅ Vérification de disponibilité avant création
- ✅ Transactions Prisma pour la cohérence des données
- ✅ Gestion des erreurs complète
- ✅ Server Actions (exécution côté serveur uniquement)

## ⚡ Performance

- ✅ Server Components par défaut (pas de JS client)
- ✅ Revalidation automatique des pages après mutation
- ✅ Index sur les champs fréquemment recherchés
- ✅ Requêtes optimisées avec `select` et `include`

## 🚀 Prochaines Étapes

1. [ ] Insérer les données de seed via Prisma Studio
2. [ ] Créer les API Routes REST (optionnel, Server Actions suffisent)
3. [ ] Implémenter l'authentification admin
4. [ ] Créer les composants frontend (catalogue, panier, checkout)
5. [ ] Ajouter l'envoi d'emails de confirmation
6. [ ] Implémenter le rate limiting

## 📊 Structure Backend Complète

```
src/
├── lib/
│   ├── prisma.ts              # Instance Prisma singleton
│   ├── db/
│   │   ├── books.ts           # Service livres
│   │   └── packs.ts           # Service packs
│   └── actions/
│       └── orders.ts          # Server Actions commandes
prisma/
├── schema.prisma              # Schéma de données
├── seed.ts                    # Script de seed TypeScript
└── seed.sql                   # Script de seed SQL (alternative)
```
