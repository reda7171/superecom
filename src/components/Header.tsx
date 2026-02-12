'use client'

import { Link } from '@/i18n/routing'
import { BookOpen, ShoppingCart, Search, Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import CartDrawer from './CartDrawer'
import { useCartStore } from '@/store/cart'
import PredictiveSearch from './PredictiveSearch'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui'
import { WishlistHeaderIcon } from './WishlistHeaderIcon'
import UserDropdown from './UserDropdown'

interface HeaderProps {
    user?: {
        fullName?: string | null
        email: string
        image?: string | null
    } | null
    notificationDropdown?: React.ReactNode
    navigation?: {
        id: string
        label: string
        url: string
    }[]
}

export default function Header({ user, notificationDropdown, navigation }: HeaderProps = { user: null }) {
    const t = useTranslations('Navigation')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { isCartOpen, openCart, closeCart } = useUIStore()
    const totalItems = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0))
    const [mounted, setMounted] = useState(false)

    // Éviter les problèmes d'hydratation
    useEffect(() => {
        setMounted(true)
    }, [])

    const displayItems = mounted ? totalItems : 0

    const defaultNavItems = [
        { href: '/books', label: t('Books') },
        { href: '/packs', label: t('Packs') },
        { href: '/community/market', label: t('Community') },
        { href: '/blog', label: t('Journal') },
        { href: '/', label: t('Home') },
    ]

    const navItems = navigation && navigation.length > 0
        ? navigation.map(item => ({ href: item.url, label: item.label }))
        : defaultNavItems

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Style Pixio */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0 mr-12">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-black tracking-tighter">
                            riwaya<span className="text-gray-400">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - Elegant & Clean */}
                    <nav className="hidden lg:flex items-center space-x-10">
                        {navItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="text-gray-900 hover:text-black font-black text-[13px] uppercase tracking-widest transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-black group-hover:w-4 transition-all duration-300" />
                            </Link>
                        ))}
                    </nav>

                    {/* Predictive Search - Large & Modern */}
                    <div className="hidden md:block flex-1 max-w-xl mx-12">
                        <PredictiveSearch />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden lg:block">
                            <LanguageSwitcher />
                        </div>

                        <WishlistHeaderIcon />

                        {/* Notifications */}
                        {notificationDropdown}

                        {/* User Dropdown */}
                        <UserDropdown user={user} />

                        {/* Cart - Style Pixio */}
                        <button onClick={openCart} className="relative group">
                            <div className="w-10 h-10 border-2 border-transparent group-hover:border-black rounded-full flex items-center justify-center transition-all">
                                <ShoppingCart className="w-6 h-6 text-gray-900" />
                                {displayItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                        {displayItems}
                                    </span>
                                )}
                            </div>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-black" />
                            ) : (
                                <Menu className="w-6 h-6 text-black" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="px-4 py-2">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                                    <Search className="w-4 h-4 text-gray-600" />
                                    <input
                                        type="text"
                                        placeholder={t('Search')}
                                        className="bg-transparent text-sm text-gray-700 outline-none flex-1"
                                    />
                                </div>
                            </div>
                            <div className="px-4 py-2">
                                <LanguageSwitcher />
                            </div>
                        </nav>
                    </div>
                )}
            </div>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        </header>
    )
}
