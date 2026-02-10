'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/i18n/routing'
import { User, Settings, Package, LogOut, ChevronDown } from 'lucide-react'
import { logout } from '@/lib/actions/community-auth'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/ui'

interface UserDropdownProps {
    user?: {
        fullName?: string | null
        email: string
        image?: string | null
    } | null
}

export default function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Fermer le dropdown si on clique à l'extérieur
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const { showNotification } = useUIStore()

    async function handleLogout() {
        setLoggingOut(true)
        await logout()
        showNotification('Déconnexion réussie', 'info')
        router.push('/community/login')
        router.refresh()
    }

    // Si pas d'utilisateur connecté, afficher le lien de connexion
    if (!user) {
        return (
            <Link
                href="/community/login"
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors group"
            >
                <User className="w-6 h-6 text-gray-900 group-hover:text-black" />
            </Link>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-full transition-colors p-1 pr-3"
            >
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border-2 border-transparent hover:border-black transition-all">
                    {user.image ? (
                        <img src={user.image} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black text-white font-black text-sm">
                            {user.fullName?.[0] || user.email[0].toUpperCase()}
                        </div>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform hidden md:block ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-black text-black truncate">{user.fullName || 'Utilisateur'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href="/community"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                                <User className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Mon Profil</span>
                        </Link>

                        <Link
                            href="/orders"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                                <Package className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Mes Commandes</span>
                        </Link>

                        <Link
                            href="/community/profile/edit"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                                <Settings className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Paramètres</span>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors group disabled:opacity-50"
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                <LogOut className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-red-600">
                                {loggingOut ? 'Déconnexion...' : 'Déconnexion'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
