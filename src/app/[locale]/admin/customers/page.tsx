import { prisma } from '@/lib/prisma'
import { Users, Zap, RefreshCw } from 'lucide-react'
import CustomersTable from '@/components/admin/CustomersTable'

async function syncCustomers() {
    // Cette fonction permet de peupler la table Customer à partir des commandes existantes
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
    })

    const customersMap = new Map()

    orders.forEach(order => {
        if (!customersMap.has(order.phone)) {
            customersMap.set(order.phone, {
                fullName: order.fullName,
                phone: order.phone,
                email: order.email,
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

    const customersToCreate = Array.from(customersMap.values())

    // Création massive (on utilise createMany si supporté, sinon boucle)
    for (const c of customersToCreate) {
        await prisma.customer.upsert({
            where: { phone: c.phone },
            update: {
                totalOrders: c.totalOrders,
                totalSpent: c.totalSpent,
                lastOrderDate: c.lastOrderDate,
                fullName: c.fullName,
                email: c.email,
                city: c.city,
                address: c.address
            },
            create: c
        })
    }
}

async function getCustomers() {
    let customers = await prisma.customer.findMany({
        orderBy: { updatedAt: 'desc' },
    })

    // Si la table est vide, on tente de synchroniser
    if (customers.length === 0) {
        await syncCustomers()
        customers = await prisma.customer.findMany({
            orderBy: { updatedAt: 'desc' },
        })
    }

    return customers.map(c => ({
        ...c,
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        email: c.email || '',
        city: c.city || '',
        address: c.address || '',
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        lastOrderDate: c.lastOrderDate
    }))
}

import CustomersPageClient from './CustomersPageClient'

export default async function AdminCustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2">
                        Lecteurs<span className="text-gray-200">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Base de données centralisée ({customers.length})
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>Total {customers.length} Profils</span>
                    </div>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Volume Ventes', value: `${customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString()} MAD` },
                    { label: 'Commandes', value: `${customers.reduce((acc, c) => acc + c.totalOrders, 0)} Total` },
                    { label: 'Panier Moyen', value: `${(customers.reduce((acc, c) => acc + c.totalSpent, 0) / (customers.reduce((acc, c) => acc + c.totalOrders, 0) || 1)).toFixed(0)} MAD` },
                    { label: 'LTV Moyen', value: `${(customers.reduce((acc, c) => acc + c.totalSpent, 0) / (customers.length || 1)).toFixed(0)} MAD` }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{stat.label}</p>
                        <p className="text-3xl font-black text-black tracking-tighter">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <CustomersPageClient initialCustomers={customers} />
        </div>
    )
}
