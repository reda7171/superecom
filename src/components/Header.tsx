'use client'

import { Link, usePathname } from '@/i18n/routing'
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
import { getWishlist } from '@/lib/actions/community-wishlist'
import { getReadingList } from '@/lib/actions/reading-list'
import { useWishlistStore } from '@/store/wishlist'
import { useReadingListStore } from '@/store/reading-list'

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
    const pathname = usePathname()
    const t = useTranslations('Navigation')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { isCartOpen, openCart, closeCart } = useUIStore()
    const totalItems = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0))
    const [mounted, setMounted] = useState(false)

    // Éviter les problèmes d'hydratation
    useEffect(() => {
        setMounted(true)
    }, [])

    // Synchronisation des données utilisateur (Favoris & Liste de lecture)
    useEffect(() => {
        const syncUserData = async () => {
            if (user) {
                try {
                    // On ne déclenche la synchro que si on est monté côté client
                    // Fetch en parallèle
                    const [wishlistData, readingListData] = await Promise.all([
                        getWishlist(),
                        getReadingList()
                    ])

                    // Mapper et mettre à jour le store Wishlist
                    const mappedWishlist: any[] = wishlistData.map((w: any) => {
                        if (w.book) {
                            return {
                                id: w.book.id, // Important: ID du livre pour la correspondance
                                type: 'BOOK',
                                title: w.book.title,
                                image: w.book.image,
                                price: w.book.price,
                                author: w.book.author,
                                slug: `/books/${w.book.id}`,
                                category: w.book.category || undefined
                            }
                        }
                        // Fallback pour les entrées sans livre lié (anciennes données)
                        return {
                            id: w.id,
                            type: 'BOOK',
                            title: w.title,
                            price: 0,
                            image: '',
                            author: w.author,
                            slug: '#',
                        }
                    })
                    useWishlistStore.setState({ items: mappedWishlist })

                    // Mapper et mettre à jour le store ReadingList
                    const mappedReadingList: any[] = readingListData.map((r: any) => ({
                        id: r.bookId || r.id, // Important: ID du livre si possible
                        title: r.title,
                        author: r.author,
                        cover: r.cover || '',
                        totalPages: r.totalPages,
                        currentPage: r.currentPage,
                        status: r.status,
                        addedAt: r.createdAt // string conversion might be needed if Date
                    }))
                    useReadingListStore.setState({ items: mappedReadingList })

                } catch (error) {
                    console.error("Erreur lors de la synchro des données utilisateur:", error)
                }
            } else {
                // Si pas d'utilisateur (logout), on efface les stores locaux pour éviter le partage de session
                useWishlistStore.getState().clearWishlist()
                useReadingListStore.getState().clearReadingList()
            }
        }

        syncUserData()
    }, [user]) // Se déclenche à chaque changement d'utilisateur (Login/Logout)

    const displayItems = mounted ? totalItems : 0

    const defaultNavItems = [
        { href: '/books', label: t('Books') },
        { href: '/packs', label: t('Packs') },
        { href: '/community/market', label: t('Community') },
        { href: '/blog', label: t('Journal') },
        { href: '/', label: t('Home') },
    ]

    const navItems = navigation && navigation.length > 0
        ? navigation.map(item => ({ href: item.url, label: t(item.label as any) }))
        : defaultNavItems

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Style Pixio */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0 ltr:mr-12 rtl:ml-12" dir="ltr">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-black tracking-tighter">
                            riwaya<span className="text-[#10b981]">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - Elegant & Clean */}
                    <nav className="hidden lg:flex items-center space-x-10">
                        {/* Navigation Items */}
                        {navItems.map((item, idx) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className={`font-black text-[13px] uppercase tracking-widest transition-colors relative group ${isActive ? 'text-black border-b-2 border-black pb-1' : 'text-gray-900 hover:text-black'}`}
                                >
                                    {item.label}
                                    {!isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-black group-hover:w-4 transition-all duration-300" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Predictive Search - Large & Modern */}
                    <div className="hidden md:block flex-1 max-w-xl mx-6">
                        <PredictiveSearch />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden lg:block">
                            <LanguageSwitcher />
                        </div>

                        {/* Desktop Only Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <WishlistHeaderIcon />
                            {mounted && notificationDropdown}
                            <button onClick={openCart} className="relative group">
                                <div className="w-10 h-10 border-2 border-transparent group-hover:border-black rounded-full flex items-center justify-center transition-all">
                                    <ShoppingCart className="w-6 h-6 text-gray-900" />
                                    {mounted && totalItems > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    )}
                                </div>
                            </button>
                            {mounted && <UserDropdown user={user} />}
                        </div>

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
                    <div className="md:hidden py-4 border-t border-gray-200 bg-white">
                        <nav className="flex flex-col space-y-3">
                            {/* Mobile Actions First */}
                            <div className="px-4 pb-4 border-b border-gray-100">
                                <div className="flex items-center justify-around gap-4">
                                    <button onClick={() => { openCart(); setMobileMenuOpen(false); }} className="relative flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center">
                                            <ShoppingCart className="w-5 h-5 text-gray-900" />
                                            {displayItems > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                                    {displayItems}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600">{t('Cart')}</span>
                                    </button>
                                    <div className="flex flex-col items-center gap-1">
                                        <WishlistHeaderIcon />
                                    </div>
                                    {notificationDropdown && (
                                        <div className="flex flex-col items-center gap-1">
                                            {notificationDropdown}
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center gap-1">
                                        <UserDropdown user={user} />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            {navItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="px-4 py-3 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-bold text-sm"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
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
