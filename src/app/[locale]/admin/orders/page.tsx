import { prisma } from '@/lib/prisma'
import { Search, Filter, Eye } from 'lucide-react'
import Link from 'next/link'
import ExportOrdersButton from '@/components/admin/ExportOrdersButton'
import { isAuthenticated } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

async function getOrders(status?: string) {
    return prisma.order.findMany({
        where: status ? { status: status as any } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    book: { select: { title: true } },
                    pack: { select: { name: true } }
                }
            },
        },
    })
}

export default async function AdminOrdersPage(props: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ status?: string }>
}) {
    const params = await props.params
    const { locale } = params
    const searchParams = await props.searchParams

    const isAuth = await isAuthenticated()
    if (!isAuth) {
        redirect(`/${locale}/admin/login`)
    }

    const orders = await getOrders(searchParams.status)

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-purple-100 text-purple-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const statusLabels = {
        PENDING: 'En attente',
        CONFIRMED: 'Confirmée',
        SHIPPED: 'En livraison',
        DELIVERED: 'Livrée',
        CANCELLED: 'Annulée',
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Commandes</h1>
                <ExportOrdersButton orders={orders} />
            </div>

            {/* Filtres */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
                    <div className="flex gap-2">
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <Link
                                key={key}
                                href={`/${locale}/admin/orders${searchParams.status === key ? '' : `?status=${key}`}`}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${searchParams.status === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                        {searchParams.status && (
                            <Link
                                href={`/${locale}/admin/orders`}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                            >
                                Réinitialiser
                            </Link>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une commande..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                    />
                </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Commande</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ville</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Articles</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    Aucune commande trouvée.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-gray-900">#{order.id.slice(0, 8)}</div>
                                            {(order as any).trackingID && (
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center" title={`Expédié: ${(order as any).trackingID}`}>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                        {order.total} MAD
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                                            {statusLabels[order.status as keyof typeof statusLabels]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
