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
    Repeat,
    AlertCircle,
    ShieldCheck,
    Ticket,
    MessageSquare,
    BarChart3,
    GripVertical,
    FileText,
    Banknote,
    TrendingUp,
    Settings,
    Crown
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/fr/admin', icon: LayoutDashboard },
    { name: 'Articles', href: '/fr/admin/posts', icon: FileText },
    { name: 'Livres', href: '/fr/admin/books', icon: BookOpen },
    { name: 'Packs', href: '/fr/admin/packs', icon: Package },
    { name: 'Commandes', href: '/fr/admin/orders', icon: ShoppingCart },
    { name: 'Clients', href: '/fr/admin/customers', icon: Users },
    { name: 'Echanges', href: '/fr/admin/exchanges', icon: Repeat },
    {
        name: 'Community',
        href: '/fr/admin/community',
        icon: Users,
        children: [
            { name: 'Top Lecteurs', href: '/fr/admin/community/top-readers', icon: Crown }
        ]
    },
    { name: 'Signalements', href: '/fr/admin/reports', icon: AlertCircle },
    { name: 'Avis', href: '/fr/admin/reviews', icon: MessageSquare },
    { name: 'Coupons', href: '/fr/admin/coupons', icon: Ticket },
    { name: 'Analytics', href: '/fr/admin/analytics', icon: BarChart3 },
    { name: 'Menus', href: '/fr/admin/menus', icon: GripVertical },
    { name: 'Finance', href: '/fr/admin/finance', icon: Banknote },
    { name: 'Traffic', href: '/fr/admin/traffic', icon: TrendingUp },
    { name: 'Paramètres', href: '/fr/admin/settings', icon: Settings },
    { name: 'Audit Log', href: '/fr/admin/audit', icon: ShieldCheck },
]

import OrderNotifications from '@/components/admin/OrderNotifications'

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

    const isLoginPage = pathname?.endsWith('/admin/login')

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main>
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <h1 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Riwaya</h1>
                        <OrderNotifications />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            // @ts-ignore
                            const hasChildren = item.children && item.children.length > 0

                            return (
                                <div key={item.name}>
                                    <Link
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

                                    {hasChildren && (
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                                            {/* @ts-ignore */}
                                            {item.children.map((child) => {
                                                const isChildActive = pathname === child.href
                                                const ChildIcon = child.icon

                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={`
                                                            flex items-center px-4 py-2 text-xs font-medium rounded-lg transition-colors
                                                            ${isChildActive
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                            }
                                                        `}
                                                    >
                                                        <ChildIcon className={`w-3.5 h-3.5 mr-3 ${isChildActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                                        {child.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
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
