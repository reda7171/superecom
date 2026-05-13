'use client'

import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { logout } from '@/lib/actions/auth'
import { getSettingsByCategory } from '@/lib/actions/site-settings'
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
    Crown,
    Gift,
    Share2,
    Store,
    Download,
    Monitor,
    ExternalLink,
    Menu,
    X,
    Languages,
    Search,
    Truck,
    Wrench,
    Sparkles,
    MessageCircle,
    Bookmark,
    Usb,
    Library,
    Database,
    ChevronDown
} from 'lucide-react'

import OrderNotifications from '@/components/admin/OrderNotifications'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { locale } = useParams()
    const lang = typeof locale === 'string' ? locale : 'fr'
    const [featureSettings, setFeatureSettings] = useState<Record<string, string>>({})
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        'Configuration': false 
    })

    useEffect(() => {
        getSettingsByCategory('features').then(setFeatureSettings)
    }, [])

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }))
    }

    const features = useMemo(() => ({
        seller: featureSettings['feature_seller'] !== 'false',
        exchange: false,
        usb: false,
        kids: false,
        readingList: featureSettings['feature_reading_list'] !== 'false',
        digital: featureSettings['feature_digital_books'] !== 'false',
        packs: featureSettings['feature_packs'] !== 'false',
    }), [featureSettings])

    const allNavigation = useMemo(() => [
        { name: 'Dashboard', href: `/${lang}/admin`, icon: LayoutDashboard },
        { name: 'Articles', href: `/${lang}/admin/posts`, icon: FileText },
        { name: 'Livres', href: `/${lang}/admin/books`, icon: BookOpen },
        { name: 'Livres Numériques', href: `/${lang}/admin/digital-products`, icon: Download, featureKey: 'feature_digital_books' },
        { name: 'Auteurs', href: `/${lang}/admin/authors`, icon: Users },
        { name: 'Packs', href: `/${lang}/admin/packs`, icon: Package, featureKey: 'feature_packs' },
        { name: 'Commandes', href: `/${lang}/admin/orders`, icon: ShoppingCart },
        { name: 'Caisse (POS)', href: `/${lang}/admin/pos`, icon: Monitor },
        { name: 'Clients', href: `/${lang}/admin/customers`, icon: Users },
        { name: 'Vendeurs', href: `/${lang}/admin/vendeurs`, icon: Store, featureKey: 'feature_seller' },
        { name: 'Signalements', href: `/${lang}/admin/reports`, icon: AlertCircle },
        { name: 'Avis', href: `/${lang}/admin/reviews`, icon: MessageSquare },
        { name: 'Commentaires', href: `/${lang}/admin/comments`, icon: MessageCircle },
        { name: 'Coupons', href: `/${lang}/admin/coupons`, icon: Ticket },
        { name: 'Affiliés', href: `/${lang}/admin/affiliates`, icon: Share2 },
        { name: 'Analytics', href: `/${lang}/admin/analytics`, icon: BarChart3 },
        { name: 'Marketing', href: `/${lang}/admin/marketing`, icon: Sparkles },
        { name: 'Marque-pages', href: `/${lang}/admin/accessories/bookmarks`, icon: Bookmark },
        { name: 'Bibliothèques', href: `/${lang}/admin/accessories/library`, icon: Library },
        { name: 'Clés USB', href: `/${lang}/admin/accessories/usb`, icon: Usb },
        { name: 'Menus', href: `/${lang}/admin/menus`, icon: GripVertical },
        { name: 'Finance', href: `/${lang}/admin/finance`, icon: Banknote },
        { name: 'Traffic', href: `/${lang}/admin/traffic`, icon: TrendingUp },
        { name: 'Traductions', href: `/${lang}/admin/translations`, icon: Languages },
        { name: 'SEO', href: `/${lang}/admin/seo`, icon: Search },
        { 
            name: 'Configuration', 
            href: `/${lang}/admin/config`, 
            icon: Wrench,
            children: [
                { name: 'API & Tracking', href: `/${lang}/admin/config/api`, icon: Sparkles },
                { name: 'Google Adsense', href: `/${lang}/admin/config/adsense`, icon: Banknote },
                { name: 'API Livraison', href: `/${lang}/admin/config/delivery`, icon: Truck },
                { name: 'Configuration n8n', href: `/${lang}/admin/config/n8n`, icon: Repeat },
                { name: 'Configuration Accueil', href: `/${lang}/admin/config/homepage`, icon: LayoutDashboard },
                { name: 'Configuration form', href: `/${lang}/admin/config/form`, icon: Settings },
                { name: 'Telegram Bot', href: `/${lang}/admin/config/telegram`, icon: MessageCircle },
                { name: 'Base de données', href: `/${lang}/admin/database`, icon: Database }
            ]
        },
        { name: 'Paramètres', href: `/${lang}/admin/settings`, icon: Settings },
        { name: 'Cadeaux', href: `/${lang}/admin/gifts`, icon: Gift },
        { name: 'Audit Log', href: `/${lang}/admin/audit`, icon: ShieldCheck },
    ], [lang])

    const isFeatureEnabled = (key: string) => {
        // @ts-ignore
        return !!features[key.replace('feature_', '')]
    }

    const navigation = useMemo(() => allNavigation.filter(item =>
        !item.featureKey || isFeatureEnabled(item.featureKey)
    ), [allNavigation, features])

    const pathname = usePathname()
    const router = useRouter()

    // Auto-expand if child is active
    useEffect(() => {
        navigation.forEach(item => {
            if (item.children && item.children.some(child => pathname === child.href)) {
                setExpandedMenus(prev => {
                    // Only update if not already expanded to avoid infinite loops
                    if (prev[item.name]) return prev;
                    return { ...prev, [item.name]: true };
                })
            }
        })
    }, [pathname, navigation])

    // Fermer sidebar sur changement de route (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    async function handleLogout() {
        await logout()
        router.push(`/${lang}/admin/login`)
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

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 md:h-20 px-5 md:px-8">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-black italic">R</span>
                    </div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">Riwaya<span className="text-blue-600">.</span></h1>
                </div>
                <div className="flex items-center gap-2">
                    <OrderNotifications />
                    {/* Bouton fermer sur mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 md:px-4 pb-6 space-y-1 overflow-y-auto custom-scrollbar" suppressHydrationWarning>
                <div className="mb-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Principal</div>
                {navigation.map((item) => {
                    const isExact = pathname === item.href
                    const isParent = pathname.startsWith(item.href + '/') && item.href !== `/${lang}/admin`
                    const isActive = isExact || isParent
                    const Icon = item.icon
                    // @ts-ignore
                    const hasChildren = item.children && item.children.length > 0

                    return (
                        <div key={item.name} className="space-y-1">
                            {hasChildren ? (
                                <div
                                    onClick={() => toggleMenu(item.name)}
                                    className={`
                                        group flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span className="flex-1">{item.name}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMenus[item.name] ? 'rotate-180' : ''}`} />
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`
                                        group flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && !hasChildren && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse ml-2" />
                                    )}
                                </Link>
                            )}

                            {hasChildren && expandedMenus[item.name] && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 py-1">
                                    {/* @ts-ignore */}
                                    {item.children.map((child) => {
                                        const isChildActive = pathname === child.href
                                        const ChildIcon = child.icon

                                        return (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className={`
                                                    flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-all
                                                    ${isChildActive
                                                        ? 'text-blue-600 bg-blue-50/50'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                    }
                                                `}
                                            >
                                                <ChildIcon className={`w-4 h-4 mr-3 ${isChildActive ? 'text-blue-600' : 'text-slate-400'}`} />
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
            <div className="p-4 md:p-6 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <LanguageSwitcher upward={true} />
                </div>
                <div className="flex items-center gap-3 mb-4 p-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                        <span className="text-sm font-bold text-white tracking-widest">AD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">Administrateur</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">admin@riwaya.store</p>
                    </div>
                </div>

                <a
                    href={`/${lang}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-2.5 mb-2 text-sm font-bold text-emerald-700 hover:text-white hover:bg-emerald-600 rounded-xl transition-all border border-emerald-200 bg-emerald-50"
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir le site
                </a>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200 bg-white"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar desktop (fixe) */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 lg:w-72 bg-white border-r border-slate-200/60 shadow-sm z-50 flex-col">
                {renderSidebarContent()}
            </aside>

            {/* Sidebar mobile (drawer) */}
            <aside className={`md:hidden fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/60 shadow-xl z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {renderSidebarContent()}
            </aside>

            {/* Main Content */}
            <div className="md:pl-64 lg:pl-72 transition-all duration-300">
                {/* Topbar mobile */}
                <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-black italic">R</span>
                        </div>
                        <span className="text-base font-black text-slate-900">Riwaya<span className="text-blue-600">.</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <OrderNotifications />
                    </div>
                </div>

                <main className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    )
}

