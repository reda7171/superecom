'use client'

import { useEffect, useState } from 'react'
import { getOrderStats } from '@/lib/actions/orders'

export default function OrderNotifications() {
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        async function fetchStats() {
            const res = await getOrderStats()
            if (res) setStats(res)
        }
        fetchStats()
        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    if (!stats) return null

    const displayItems = [
        { label: 'En attente', count: stats.PENDING, color: 'text-orange-600 bg-orange-50' },
        { label: 'Confirmées', count: stats.CONFIRMED, color: 'text-blue-600 bg-blue-50' },
        { label: 'En livraison', count: stats.SHIPPED, color: 'text-purple-600 bg-purple-50' },
        { label: 'Livrées', count: stats.DELIVERED, color: 'text-green-600 bg-green-50' },
    ]

    return (
        <div className="flex items-center gap-1">
            {displayItems.map((item, idx) => (
                <div
                    key={idx}
                    title={item.label}
                    className={`w-6 h-6 flex items-center justify-center rounded-md text-[9px] font-black cursor-help border transition-all hover:scale-110 ${item.color} border-current/10`}
                >
                    {item.count}
                </div>
            ))}
        </div>
    )
}
