import { prisma } from '@/lib/prisma'
import { Users, ShoppingBag, MapPin, Phone } from 'lucide-react'

async function getCustomers() {
    // On groupe par téléphone pour identifier les clients uniques
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
    })

    // Map pour stocker les clients uniques
    const customersMap = new Map()

    orders.forEach(order => {
        if (!customersMap.has(order.phone)) {
            customersMap.set(order.phone, {
                fullName: order.fullName,
                phone: order.phone,
                city: order.city,
                address: order.address,
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: order.createdAt
            })
        }
        const client = customersMap.get(order.phone)
        client.totalOrders += 1
        client.totalSpent += order.total
    })

    return Array.from(customersMap.values())
}

export default async function AdminCustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {customers.length} Clients uniques
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Localisation</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Commandes</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Total Dépensé</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Dernière activité</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                                    Aucun client enregistré pour le moment.
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.phone} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-md">
                                                {customer.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{customer.fullName}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {customer.city}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{customer.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                            <ShoppingBag className="w-3 h-3" />
                                            {customer.totalOrders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                                        {customer.totalSpent.toFixed(0)} MAD
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(customer.lastOrderDate).toLocaleDateString('fr-FR')}
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
