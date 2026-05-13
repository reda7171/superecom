'use client'

import React from 'react'
import { Download, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { useTranslations } from 'next-intl'
import { notifyAddToCart } from '@/lib/actions/cart-notify'

interface Props {
  product: {
    id: string
    title: string
    price: number
    image: string
  }
}

export default function DigitalAddToCartButton({ product }: Props) {
  const t = useTranslations('Common')
  const addItem = useCartStore(state => state.addItem)
  const openCart = useUIStore(state => state.openCart)

  const handleAddToCart = () => {
    addItem({
      type: 'DIGITAL',
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    })

    // Telegram Notification
    notifyAddToCart(product.title, product.price, 'DIGITAL').catch(console.error)

    // Ouvrir le panier
    openCart()
  }

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-amber-400 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-400/20 transition-all active:scale-95"
    >
      <ShoppingCart className="w-5 h-5" />
      <span>{t('AddToCart')}</span>
    </button>
  )
}
