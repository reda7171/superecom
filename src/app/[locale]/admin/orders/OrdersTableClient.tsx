'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Search, Trash2, AlertCircle } from 'lucide-react'
import { bulkDeleteOrders } from '@/lib/actions/admin-orders'
import { useRouter } from 'next/navigation'

interface OrderItem {
    id: string
    quantity: number
    price: number
    costPrice?: number
    book?: { title: string }
    pack?: { name: string }
}

interface Order {
    id: string
    createdAt: Date
    fullName: string
    phone: string
    city: string
    total: number
    status: string
    trackingID?: string | null
    items: OrderItem[]
}

interface OrdersTableClientProps {
    orders: Order[]
    locale: string
    statusColors: Record<string, string>
    statusLabels: Record<string, string>
    searchTerm: string
}

export default function OrdersTableClient({
    orders,
    locale,
    statusColors,
    statusLabels,
    searchTerm
}: OrdersTableClientProps) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredOrders = orders.filter(order =>
        order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.city.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredOrders.map(o => o.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id))
        } else {
            setSelectedIds(prev => [...prev, id])
        }
    }

    const handleDeleteBulk = async () => {
        if (!selectedIds.length) return
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} commandes ? cette action est irréversible.`)) return

        setIsDeleting(true)
        try {
            const res = await bulkDeleteOrders(selectedIds)
            if (res.success) {
                setSelectedIds([])
                router.refresh()
            } else {
                alert(res.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            alert('Une erreur est survenue')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Total: <span className="text-gray-900 font-black">{filteredOrders.length}</span> / {orders.length}
                    </p>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDeleteBulk}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                                    className="rounded border-gray-300 text-black focus:ring-black"
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Commande</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ville</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Articles</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Marge Nette</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                    Aucune commande trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(order.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(order.id)}
                                            onChange={() => handleSelectOne(order.id)}
                                            className="rounded border-gray-300 text-black focus:ring-black"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-gray-900">#{order.id.slice(0, 8)}</div>
                                            {order.trackingID && (
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center" title={`Expédié: ${order.trackingID}`}>
                                                    <Search className="w-2.5 h-2.5 text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('fr-FR')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{order.fullName}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.city}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-bold">
                                            {order.items.reduce((s: number, i: any) => s + i.quantity, 0)} article{order.items.reduce((s: number, i: any) => s + i.quantity, 0) > 1 ? 's' : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                        {order.total} MAD
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(() => {
                                            const itemCosts = order.items.reduce((sum, item) => sum + ((item as any).costPrice || 0) * item.quantity, 0);
                                            const netProfit = order.total - itemCosts - 2.65;
                                            return (
                                                <span className={`text-sm font-black px-2 py-1 rounded-lg ${netProfit >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {netProfit > 0 ? '+' : ''}{netProfit.toFixed(2)} MAD
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                                            {statusLabels[order.status as keyof typeof statusLabels]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                                        <a 
                                            href={`https://wa.me/212${order.phone.replace(/^0+/, '')}?text=Bonjour ${order.fullName}, votre commande a bien été reçue sur Riwaya.`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-900 font-bold text-sm bg-green-50 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            <span className="text-sm">💬</span> WhatsApp
                                        </a>
                                        <Link
                                            href={`/${locale}/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
