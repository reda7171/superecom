'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { useTranslations } from 'next-intl'
import { fbPixelEvents } from '@/lib/facebook-pixel'

interface AddToCartButtonProps {
    product: {
        id: string
        title: string
        price: number
        image: string
        type: 'BOOK' | 'PACK'
    }
    variant?: 'primary' | 'secondary'
    className?: string
}

export default function AddToCartButton({
    product,
    variant = 'primary',
    className = ''
}: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem)
    const openCart = useUIStore((state) => state.openCart)
    const showNotification = useUIStore((state) => state.showNotification)
    const t = useTranslations('Common');

    return (
        <button
            className={`w-full flex items-center justify-center gap-3 font-bold rounded-2xl active:scale-95 transition-all shadow-lg hover:shadow-black/20 ${variant === 'primary'
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white text-black border-2 border-black hover:bg-gray-50'
                } py-5 px-8 ${className}`}
            onClick={() => {
                try {
                    console.log('Adding product to cart:', product.id)
                    addItem({
                        type: product.type,
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                    })

                    // Facebook Pixel Tracking
                    fbPixelEvents.addToCart({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        quantity: 1
                    })

                    openCart()
                    showNotification(t('AddedToCartSuccess'), 'success')
                } catch (error) {
                    console.error('Failed to add to cart:', error)
                    showNotification(t('AddedToCartError'), 'error')
                }
            }}
        >
            <ShoppingCart className="w-6 h-6 rtl:flip" />
            <span className="text-lg uppercase tracking-widest text-[10px] font-black">{t('AddToCart')}</span>
        </button>
    )
}
