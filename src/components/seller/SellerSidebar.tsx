'use client'

import React from 'react'
import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import { logout as communityLogout } from '@/lib/actions/community-auth'
import {
    LayoutDashboard,
    BookOpen,
    ShoppingCart,
    LogOut,
    PlusCircle,
    User
} from 'lucide-react'

export default function SellerSidebar({ user }: { user: any }) {
    const pathname = usePathname()

    const navigation = [
        { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
        { name: 'Mes Livres', href: '/seller/books', icon: BookOpen },
        { name: 'Mes Commandes', href: '/seller/orders', icon: ShoppingCart },
    ]

    async function handleLogout() {
        await communityLogout()
        window.location.href = '/'
    }

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50">
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <Link href="/" className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                        Riwaya <span className="text-pixio-yellow">Seller</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.endsWith(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link
                            href="/seller/books/new"
                            className="flex items-center px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                            <PlusCircle className="w-5 h-5 mr-3" />
                            Nouveau Livre
                        </Link>
                    </div>
                </nav>

                {/* User Section (Similar to Admin) */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                                {user?.fullName?.substring(0, 2).toUpperCase() || 'SE'}
                            </span>
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'Vendeur'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                    </button>
                </div>
            </div>
        </aside>
    )
}
