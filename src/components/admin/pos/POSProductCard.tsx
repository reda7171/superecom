'use client';

import { Plus, Store } from 'lucide-react';
import { Product, Pack } from '@prisma/client';

interface POSProductCardProps {
  product: Product | Pack;
  type: 'BOOK' | 'PACK';
  onAdd: (product: Product | Pack, type: 'BOOK' | 'PACK') => void;
}

export default function POSProductCard({ product, type, onAdd }: POSProductCardProps) {
  const name = 'title' in product ? product.title : product.name;
  const price = product.price;
  const image = product.image;

  return (
    <div 
      className="bg-white rounded-[1.5rem] p-3 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer border border-gray-100 group flex flex-col h-full active:scale-[0.98]"
      onClick={() => onAdd(product, type)}
    >
      <div className="relative aspect-[3/4] mb-3 rounded-[1rem] overflow-hidden bg-gray-50 border border-gray-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/product-placeholder.png' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1 bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Store className="w-4 h-4" />
            </div>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
            {type === 'PACK' && (
                <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-tighter">Pack</span>
            )}
            {'stock' in product && (
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-tighter ${product.stock > 0 ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                    {product.stock > 0 ? `${product.stock} Dispo` : 'Épuisé'}
                </span>
            )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <h3 className="font-black text-black text-[11px] line-clamp-2 uppercase tracking-tight mb-2 leading-tight h-[2.5em]">{name}</h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-blue-600 font-black text-xs tracking-tighter">{price.toFixed(0)} MAD</span>
          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <Plus className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
