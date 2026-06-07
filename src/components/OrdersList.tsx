'use client'

import React, { useState } from 'react'
import { Package, Calendar, MapPin, Phone, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

interface OrderListProps {
    orders: any[]
    locale: string
}

export default function OrderList({ orders, locale }: OrderListProps) {
    const t = useTranslations('Orders')

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-black mb-2">{t('EmptyTitle')}</h3>
                <p className="text-gray-400 text-sm font-bold">
                    {t('EmptyDesc')}
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-100">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-black text-black">
                                        {t('OrderNumber')}{order.id.slice(0, 8)}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {t(`Status.${order.status}`)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <p className="text-2xl font-black text-black">
                                    {order.total.toFixed(2)} DH
                                </p>
                                {order.status !== 'CANCELLED' && !order.trackingID && (
                                    <Link
                                        href={`/tracking?orderId=${order.id}&contact=${order.phone || order.email || ''}`}
                                        className="text-black bg-white border-2 border-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95"
                                    >
                                        {t('TrackButton')}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4 mb-6">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4 flex-grow">
                                        <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                                            {(item.product?.image || item.digitalProduct?.image) && (
                                                <img
                                                    src={item.product?.image || item.digitalProduct?.image}
                                                    alt={item.product?.title || item.digitalProduct?.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-black text-sm text-black line-clamp-1">
                                                    {item.product?.title || item.pack?.name || item.digitalProduct?.title || 'Article'}
                                                </h4>
                                                {item.type === 'DIGITAL' && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-md shrink-0">
                                                        PDF
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                {t('Quantity')} {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-black text-sm text-black whitespace-nowrap">
                                            {item.price.toFixed(2)} DH
                                        </p>
                                    </div>

                                    {/* Action pour les livres digitaux - Page de lecture dédiée */}
                                    {item.type === 'DIGITAL' && (
                                        <Link
                                            href={`/livres-numeriques/reader/${item.digitalProductId}`}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Lire maintenant</span>
                                        </Link>
                                    )}
                                </div>
                            )) || (
                                    <p className="text-sm text-gray-400">Aucun article</p>
                                )}
                        </div>

                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                        {t('DeliveryAddress')}
                                    </p>
                                    <p className="text-sm font-bold text-black leading-tight">
                                        {order.address}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                        {order.city}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                        {t('Contact')}
                                    </p>
                                    <p className="text-sm font-bold text-black">
                                        {order.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Info (If physical product) */}
                        {order.trackingID && (
                            <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50/50 p-6 rounded-3xl space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black p-3 rounded-2xl">
                                            <Package className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                                                {t('TrackingTitle')}
                                            </p>
                                            <p className="text-sm font-black text-black font-mono tracking-wider">
                                                {order.trackingID}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/tracking?orderId=${order.id}&contact=${order.phone || order.email || ''}`}
                                        className="text-white bg-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 text-center"
                                    >
                                        {t('TrackButton')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </>
    )
}
