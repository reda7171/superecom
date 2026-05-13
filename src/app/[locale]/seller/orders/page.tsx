import { getSellerOrders } from '@/lib/actions/seller/dashboard'
import { ShoppingBag, Calendar, User, Mail, Phone, MapPin, Eye, CheckCircle2 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { normalizeImage } from '@/lib/utils'

export default async function SellerOrdersPage() {
    const orders = await getSellerOrders()

    const statusLabels = {
        PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        SHIPPED: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700 border-green-200' },
        CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700 border-red-200' },
        RETURNED: { label: 'Retournée', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tighter uppercase tracking-tight">Mes commandes</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Suivi et gestion des ventes Marketplace</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total commandes</p>
                        <p className="text-2xl font-black text-black tracking-tighter">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-pixio-cream rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-black" />
                    </div>
                </div>
            </div>

            {/* Orders Table-like Cards */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-24 text-center border-dashed border-4 border-gray-100">
                    <ShoppingBag className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                    <p className="text-gray-400 font-bold text-sm">Aucune commande reçue pour le moment.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => {
                        const status = (statusLabels[order.status as keyof typeof statusLabels] || statusLabels.PENDING)
                        return (
                            <div key={order.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-black/5 hover:border-black/5 transition-all group">
                                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
                                    {/* Order Info */}
                                    <div className="w-full md:w-1/3 flex flex-col gap-6 pr-10 border-r border-gray-50 border-dashed">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-black uppercase tracking-widest text-black">Commande #{order.id.slice(-6).toUpperCase()}</div>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                                                {status.label}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 text-gray-500 font-bold text-sm">
                                                <Calendar className="w-4 h-4 text-gray-300" />
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR')} à {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-4 text-gray-900 font-black text-sm">
                                                <User className="w-4 h-4 text-gray-300" />
                                                {order.fullName}
                                            </div>
                                            <div className="flex items-center gap-4 text-gray-500 font-bold text-xs">
                                                <MapPin className="w-4 h-4 text-gray-300" />
                                                {order.city}, {order.address.slice(0, 30)}...
                                            </div>
                                            <div className="flex items-center gap-4 text-blue-600 font-black text-xs underline decoration-2 underline-offset-4 decoration-blue-100">
                                                <Phone className="w-4 h-4 text-blue-200" />
                                                {order.phone}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-gray-50">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">Montant Total</p>
                                            <div className="text-3xl font-black text-black tracking-tighter">
                                                {order.total.toFixed(2)} <span className="text-sm">MAD</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="w-full md:w-2/3">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Articles ({order.items.length})</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="bg-gray-50 rounded-2xl p-4 flex gap-4 hover:shadow-lg transition-all group/item">
                                                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                                                        <img src={normalizeImage(item.book?.image || '')} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex flex-col justify-center min-w-0">
                                                        <h4 className="text-xs font-black text-black truncate group-hover/item:text-amber-600 transition-colors">{item.book?.title}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{item.quantity} x {item.price.toFixed(2)} MAD</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-3 mt-10">
                                            <button className="bg-gray-50 text-gray-400 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
                                                Modifier Statut
                                            </button>
                                            <button className="bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-pixio-yellow hover:text-black transition-all shadow-xl active:scale-95 group/btn">
                                                Expédier <Eye className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
