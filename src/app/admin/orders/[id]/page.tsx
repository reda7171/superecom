import { getOrderById } from '@/lib/actions/orders'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock, Package, ShoppingBag } from 'lucide-react'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'

export default async function OrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const order = await getOrderById(id)

    if (!order) {
        notFound()
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Retour aux commandes
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900">
                        Commande <span className="text-blue-600">#{order.id.slice(0, 8)}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900">Articles commandés</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => {
                                const product = item.book || item.pack
                                return (
                                    <div key={item.id} className="p-6 flex gap-4">
                                        <div className="relative w-20 h-28 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                            {product?.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt="Produit"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900 line-clamp-2">
                                                    {item.book?.title || item.pack?.name}
                                                </h3>
                                                <span className="text-sm font-black text-blue-600">
                                                    {item.price} MAD
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {item.type === 'PACK' ? 'Pack Exclusive' : `Par ${item.book?.author}`}
                                            </p>
                                            <div className="pt-2 flex items-center justify-between">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
                                                    Qté: {item.quantity}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    Total: {item.price * item.quantity} MAD
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="bg-gray-50 p-6 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total de la commande</span>
                                <span className="text-2xl font-black text-blue-600">
                                    {order.total} MAD
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Commentaire */}
                    {order.comment && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Commentaire client</h3>
                            <p className="text-gray-600 italic">"{order.comment}"</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Client
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-black">Nom & Prénom</p>
                                    <p className="font-bold text-gray-900">{order.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-black">Téléphone</p>
                                    <p className="font-bold text-gray-900">{order.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Livraison
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-black">Ville</p>
                                <p className="font-bold text-gray-900">{order.city}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-black">Adresse</p>
                                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                    {order.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Historique
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Créée le</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            {order.updatedAt && (
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Mise à jour le</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(order.updatedAt).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
