# Facebook Pixel - Guide d'intégration

## Configuration

### 1. Variables d'environnement
```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=votre_pixel_id
```

### 2. Obtenir le Pixel ID
1. Accédez à [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Créez un nouveau pixel ou sélectionnez-en un existant
3. Copiez le Pixel ID (format: 123456789012345)

## Utilisation

### Événements automatiques
- **PageView** : Tracké automatiquement sur chaque navigation

### Événements e-commerce

```typescript
import { fbPixelEvents } from '@/lib/facebook-pixel'

// Vue d'un produit
fbPixelEvents.viewContent({
  id: book.id,
  title: book.title,
  price: book.price,
  category: book.category
})

// Ajout au panier
fbPixelEvents.addToCart({
  id: book.id,
  title: book.title,
  price: book.price,
  quantity: 1
})

// Début du checkout
fbPixelEvents.initiateCheckout({
  items: cartItems,
  total: cartTotal
})

// Achat complété
fbPixelEvents.purchase({
  id: orderId,
  total: orderTotal,
  items: orderItems
})

// Recherche
fbPixelEvents.search('développement personnel')

// Lead (newsletter, contact)
fbPixelEvents.lead('newsletter')
fbPixelEvents.contact()
```

### Événements personnalisés

```typescript
import { fbCustomEvents } from '@/lib/facebook-pixel'

// Échange de livre
fbCustomEvents.exchangeInitiated(bookId)
fbCustomEvents.exchangeCompleted(exchangeId)

// Wishlist
fbCustomEvents.addToWishlist(bookId)
```

## Exemples d'intégration

### Page produit
```typescript
'use client'
import { useEffect } from 'react'
import { fbPixelEvents } from '@/lib/facebook-pixel'

export default function BookPage({ book }) {
  useEffect(() => {
    fbPixelEvents.viewContent({
      id: book.id,
      title: book.title,
      price: book.price,
      category: book.category
    })
  }, [book])
  
  return <div>...</div>
}
```

### Bouton "Ajouter au panier"
```typescript
const handleAddToCart = () => {
  // Logique d'ajout au panier
  addToCart(book)
  
  // Track Facebook
  fbPixelEvents.addToCart({
    id: book.id,
    title: book.title,
    price: book.price,
    quantity: 1
  })
}
```

### Page checkout
```typescript
useEffect(() => {
  fbPixelEvents.initiateCheckout({
    items: cart.items,
    total: cart.total
  })
}, [])
```

### Confirmation de commande
```typescript
const handleOrderComplete = async (order) => {
  // Créer la commande
  await createOrder(order)
  
  // Track Facebook
  fbPixelEvents.purchase({
    id: order.id,
    total: order.total,
    items: order.items
  })
}
```

## Vérification

### Test Pixel
1. Installez [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)
2. Naviguez sur le site
3. Vérifiez que les événements sont détectés

### Events Manager
1. Accédez à Facebook Events Manager
2. Sélectionnez votre pixel
3. Vérifiez les événements en temps réel dans "Test Events"

## Événements disponibles

### Standard Events
- ✅ PageView
- ✅ ViewContent
- ✅ AddToCart
- ✅ InitiateCheckout
- ✅ Purchase
- ✅ Search
- ✅ Lead
- ✅ Contact

### Custom Events
- ✅ ExchangeInitiated
- ✅ ExchangeCompleted
- ✅ AddToWishlist

## Performance

Le pixel est chargé de manière asynchrone et n'impacte pas les Core Web Vitals.

## Sécurité

- Le Pixel ID est public (NEXT_PUBLIC_)
- Aucune donnée sensible n'est transmise
- Conforme RGPD (avec consentement cookies)
