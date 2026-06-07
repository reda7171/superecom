'use client'

import { Link } from '@/i18n/routing'
import { Download, FileText, Star, BookOpen, ShoppingCart } from 'lucide-react'
import { normalizeImage } from '@/lib/utils'
import { useState } from 'react'

interface DigitalProductCardProps {
  product: {
    id: string
    title: string
    author: string
    description: string
    price: number
    originalPrice?: number | null
    image: string
    category?: string | null
    language: string
    pages?: number | null
    fileSize?: string | null
    featured: boolean
    downloadCount: number
  }
}

export default function DigitalProductCard({ product }: DigitalProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const imgSrc = imageError ? '/product-placeholder.png' : normalizeImage(product.image)

  return (
    <Link
      href={`/livres-numeriques/${product.id}`}
      className="group relative flex flex-col bg-white rounded-3xl border border-gray-100 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-100 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden rounded-t-3xl">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Overlay PDF badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          <FileText className="w-3 h-3 text-amber-400" />
          <span>PDF</span>
        </div>

        {/* Réduction badge */}
        {discount && discount > 0 && (
          <div className="absolute top-3 left-3 bg-amber-400 text-black text-xs font-black px-2.5 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 bg-black text-amber-400 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            Top
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        {product.category && (
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
            {product.category}
          </span>
        )}

        <div className="flex-grow space-y-1">
          <h3 className="font-black text-black text-sm leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-gray-400 font-bold italic">{product.author}</p>
        </div>

        {/* Méta */}
        {(product.pages || product.fileSize) && (
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
            {product.pages && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {product.pages} p.
              </span>
            )}
            {product.fileSize && (
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {product.fileSize}
              </span>
            )}
          </div>
        )}

        {/* Prix + action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="space-y-0.5">
            <p className="text-xl font-black text-black">{product.price} MAD</p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">{product.originalPrice} MAD</p>
            )}
          </div>
          <div className="w-10 h-10 bg-black group-hover:bg-amber-400 rounded-full flex items-center justify-center transition-colors">
            <ShoppingCart className="w-4 h-4 text-white group-hover:text-black transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}
