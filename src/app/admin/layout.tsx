'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import {
    LayoutDashboard,
    BookOpen,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Ticket,
    MessageSquare
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Livres', href: '/admin/books', icon: BookOpen },
    { name: 'Packs', href: '/admin/packs', icon: Package },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Clients', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Avis', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Marketing', href: '/admin/marketing', icon: LayoutDashboard },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    async function handleLogout() {
        await logout()
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">Riwaya Admin</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
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
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">AD</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Admin</p>
                                <p className="text-xs text-gray-500">admin@riwaya.com</p>
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

            {/* Main Content */}
            <div className="pl-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
