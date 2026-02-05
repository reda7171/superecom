'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'

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

    return (
        <button
            className={`w-full flex items-center justify-center gap-3 font-bold rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-xl ${variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                } py-4 px-8 ${className}`}
            onClick={() => {
                addItem({
                    type: product.type,
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                })
            }}
        >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-lg">Ajouter au panier</span>
        </button>
    )
}
