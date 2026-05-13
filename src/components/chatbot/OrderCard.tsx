'use client'

import React from 'react'
import { Calendar, Package, MapPin, ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface OrderData {
    id: string
    name: string
    total: number
    status: string
    statusLabel: string
    date: string
    estimated: string
    city: string
}

interface OrderCardProps {
    order: OrderData
    t: any
}

export default function OrderCard({ order, t }: OrderCardProps) {
    const isDelivered = order.status === 'DELIVERED'
    const progress = 
        order.status === 'PENDING' ? 20 : 
        order.status === 'CONFIRMED' ? 45 : 
        order.status === 'SHIPPED' ? 75 : 
        100

    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'fr'

    return (
        <div className="mt-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4 shadow-sm backdrop-blur-sm">
            <div className="flex justify-between items-start border-b border-gray-100/50 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">ID Commande</p>
                        <p className="font-black text-gray-900 text-sm">#{order.id.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total</p>
                    <p className="font-black text-orange-600 text-sm">{order.total} DH</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <div className="flex flex-col">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter leading-none">{t.estimated}</p>
                        <p className="text-[10px] font-black text-gray-800">{order.estimated}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <div className="flex flex-col">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter leading-none">Destination</p>
                        <p className="text-[10px] font-black text-gray-800 line-clamp-1">{order.city || 'Maroc'}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{order.statusLabel}</p>
                    <p className="text-[10px] font-black text-gray-900">{progress}%</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                        className={`h-full ${isDelivered ? 'bg-green-500' : 'bg-orange-500'} transition-all duration-1000 ease-out relative`} 
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
            </div>

            <a href={`/${locale}/tracking?orderId=${order.id}`} className="w-full py-3 bg-white border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group">
                {t.trackOrder}
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
        </div>
    )
}
