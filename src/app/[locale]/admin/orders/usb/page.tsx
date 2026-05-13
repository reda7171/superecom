import { prisma } from '@/lib/prisma'
import { Usb, Eye, Filter, Phone, MapPin, Languages } from 'lucide-react'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

async function getUsbOrders(status?: string) {
    return prisma.order.findMany({
        where: {
            // Commandes USB identifiées par le commentaire
            comment: { startsWith: '[CLÉ USB]' },
            ...(status ? { status: status as any } : {})
        },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    })
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    SHIPPED: 'En livraison',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
}

// Extraire les langues du commentaire
function extractLangs(comment: string | null): string {
    if (!comment) return '—'
    const match = comment.match(/Langues:\s*([^|]+)/)
    return match ? match[1].trim() : '—'
}

export default async function UsbOrdersPage(props: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ status?: string }>
}) {
    const { locale } = await props.params
    const { status } = await props.searchParams

    const isAuth = await isAuthenticated()
    if (!isAuth) redirect(`/${locale}/admin/login`)

    const orders = await getUsbOrders(status)

    const totals = {
        all: orders.length,
        PENDING: orders.filter(o => o.status === 'PENDING').length,
        CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Usb className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Commandes — Clé USB</h1>
                        <p className="text-gray-400 text-sm">{totals.all} commande{totals.all > 1 ? 's' : ''} au total</p>
                    </div>
                </div>
                {/* Lien retour commandes principales */}
                <Link href={`/${locale}/admin/orders`} className="text-sm text-gray-500 hover:text-gray-900 underline">
                    ← Toutes les commandes
                </Link>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: totals.all, color: 'bg-gray-100 text-gray-700' },
                    { label: 'En attente', value: totals.PENDING, color: 'bg-yellow-100 text-yellow-700' },
                    { label: 'Confirmées', value: totals.CONFIRMED, color: 'bg-blue-100 text-blue-700' },
                    { label: 'Livrées', value: totals.DELIVERED, color: 'bg-green-100 text-green-700' },
                ].map(s => (
                    <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
                        <p className="text-3xl font-black">{s.value}</p>
                        <p className="text-sm font-medium mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtres statut */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-2 items-center">
                <Filter className="w-4 h-4 text-gray-400" />
                <Link
                    href={`/${locale}/admin/orders/usb`}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${!status ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Toutes
                </Link>
                {Object.entries(statusLabels).map(([key, label]) => (
                    <Link
                        key={key}
                        href={`/${locale}/admin/orders/usb?status=${key}`}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${status === key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-teal-50 border-b border-teal-100">
                        <tr>
                            <th className="px-5 py-4 text-left text-xs font-bold text-teal-700 uppercase">#</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-teal-700 uppercase">Client</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-teal-700 uppercase">Langues</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-teal-700 uppercase">Ville</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-teal-700 uppercase">Total</th>
                            <th className="px-5 py-4 text-left text-xs font-bold text-teal-700 uppercase">Statut</th>
                            <th className="px-5 py-4 text-right text-xs font-bold text-teal-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                                    <Usb className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                    Aucune commande de clé USB trouvée.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <p className="text-sm font-black text-gray-900">#{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <p className="text-sm font-semibold text-gray-900">{order.fullName}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {order.phone}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="flex items-center gap-1 text-sm font-bold text-teal-700">
                                            <Languages className="w-4 h-4" />
                                            {extractLangs((order as any).comment)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="flex items-center gap-1 text-sm text-gray-600">
                                            <MapPin className="w-3 h-3" /> {order.city}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-teal-700">
                                        {order.total} MAD
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <Link
                                            href={`/${locale}/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-900 font-bold text-sm bg-teal-50 px-3 py-1 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> Détails
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
