'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { logout } from '@/lib/actions/auth'
import {
    LayoutDashboard,
    LogOut,
    Users,
    TrendingUp,
    ShoppingBag,
    Share2
} from 'lucide-react'

export default function InfluencerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const locale = useLocale()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    async function handleLogout() {
        await logout()
        router.push('/admin/login')
        router.refresh()
    }

    // Helper to avoid hydration mismatch on active classes
    const getActiveLinkClass = (path: string) => {
        if (!mounted) return 'text-gray-500 hover:bg-gray-50'
        return pathname === path 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
            : 'text-gray-500 hover:bg-gray-50'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Simple pour Influenceur */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed inset-y-0">
                <div className="h-20 flex items-center justify-center border-b border-gray-100">
                    <h1 className="text-xl font-black text-indigo-600 uppercase tracking-tighter">SuperEcom <span className="text-gray-900 border-l-2 border-gray-100 ml-2 pl-2 text-xs">Affiliés</span></h1>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    <Link
                        href={`/${locale}/influencer`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${getActiveLinkClass('/influencer')}`}
                    >
                        <Share2 className="w-5 h-5" />
                         Affiliés
                    </Link>

                    <Link
                        href={`/${locale}/influencer/orders`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${getActiveLinkClass('/influencer/orders')}`}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Commandes
                    </Link>
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-black text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 md:pl-64">
                {children}
            </main>
        </div>
    )
}
