import { trackEvent, trackCustomEvent } from '@/components/FacebookPixel'

// Événements standard Facebook
export const fbPixelEvents = {
    // Vue produit
    viewContent: (product: {
        id: string
        title: string
        price: number
        category?: string
    }) => {
        trackEvent('ViewContent', {
            content_ids: [product.id],
            content_name: product.title,
            content_type: 'product',
            value: product.price,
            currency: 'MAD',
            content_category: product.category || 'Books'
        })
    },

    // Ajout au panier
    addToCart: (product: {
        id: string
        title: string
        price: number
        quantity: number
    }) => {
        trackEvent('AddToCart', {
            content_ids: [product.id],
            content_name: product.title,
            content_type: 'product',
            value: product.price * product.quantity,
            currency: 'MAD'
        })
    },

    // Début du checkout
    initiateCheckout: (cart: {
        items: Array<{ id: string; price: number; quantity: number }>
        total: number
    }) => {
        trackEvent('InitiateCheckout', {
            content_ids: cart.items.map(item => item.id),
            num_items: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            value: cart.total,
            currency: 'MAD'
        })
    },

    // Commande complétée
    purchase: (order: {
        id: string
        total: number
        items: Array<{ id: string; price: number; quantity: number }>
    }) => {
        trackEvent('Purchase', {
            content_ids: order.items.map(item => item.id),
            content_type: 'product',
            value: order.total,
            currency: 'MAD',
            num_items: order.items.reduce((sum, item) => sum + item.quantity, 0)
        })
    },

    // Recherche
    search: (query: string) => {
        trackEvent('Search', {
            search_string: query
        })
    },

    // Lead (inscription newsletter, contact)
    lead: (type: string) => {
        trackEvent('Lead', {
            content_name: type
        })
    },

    // Contact
    contact: () => {
        trackEvent('Contact')
    },

    // Faire un don
    donate: (amount: number) => {
        trackEvent('Donate', {
            value: amount,
            currency: 'MAD'
        })
    },

    // Inscription terminée
    completeRegistration: () => {
        trackEvent('CompleteRegistration')
    },

    // Ajout d'infos de paiement
    addPaymentInfo: () => {
        trackEvent('AddPaymentInfo')
    },

    // Ajout à la wishlist (Standard)
    addToWishlist: (product: { id: string; title: string }) => {
        trackEvent('AddToWishlist', {
            content_ids: [product.id],
            content_name: product.title,
            content_type: 'product'
        })
    }
}

// Événements personnalisés
export const fbCustomEvents = {
    // Échange de livre initié
    exchangeInitiated: (bookId: string) => {
        trackCustomEvent('ExchangeInitiated', {
            book_id: bookId
        })
    },

    // Échange complété
    exchangeCompleted: (exchangeId: string) => {
        trackCustomEvent('ExchangeCompleted', {
            exchange_id: exchangeId
        })
    }
}
