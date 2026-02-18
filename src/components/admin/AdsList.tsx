'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { AdPlacement } from '@prisma/client'
import { deleteAd, updateAd } from '@/lib/actions/advertisements'
import { useRouter } from 'next/navigation'

interface Advertisement {
    id: string
    title: string
    image: string
    link: string | null
    placement: AdPlacement
    isActive: boolean
    priority: number
    startDate: Date | null
    endDate: Date | null
    clickCount: number
    viewCount: number
    createdAt: Date
}

interface AdsListProps {
    ads: Advertisement[]
}

const PLACEMENT_LABELS: Record<AdPlacement, string> = {
    HOMEPAGE_TOP: 'Page d\'accueil - Haut',
    HOMEPAGE_MIDDLE: 'Page d\'accueil - Milieu',
    HOMEPAGE_BOTTOM: 'Page d\'accueil - Bas',
    SIDEBAR: 'Barre latérale',
    BETWEEN_PRODUCTS: 'Entre les produits',
    BOOK_PAGE: 'Page livre',
    CHECKOUT: 'Checkout',
    FOOTER: 'Footer',
}

export default function AdsList({ ads }: AdsListProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleToggleActive = async (id: string, currentState: boolean) => {
        setLoading(id)
        try {
            await updateAd(id, { isActive: !currentState })
            router.refresh()
        } catch (error) {
            console.error('Error toggling ad:', error)
        } finally {
            setLoading(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return

        setLoading(id)
        try {
            await deleteAd(id)
            router.refresh()
        } catch (error) {
            console.error('Error deleting ad:', error)
        } finally {
            setLoading(null)
        }
    }

    const getCTR = (clicks: number, views: number) => {
        if (views === 0) return '0%'
        return ((clicks / views) * 100).toFixed(2) + '%'
    }

    return (
        <div className="space-y-4">
            {ads.map((ad) => (
                <div
                    key={ad.id}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                    <div className="flex gap-6">
                        {/* Image Preview */}
                        <div className="w-48 h-32 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-grow space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-black">{ad.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {PLACEMENT_LABELS[ad.placement]} • Priorité: {ad.priority}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${ad.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {ad.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold">{ad.viewCount.toLocaleString()}</span>
                                    <span className="text-gray-500">vues</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold">{ad.clickCount.toLocaleString()}</span>
                                    <span className="text-gray-500">clics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{getCTR(ad.clickCount, ad.viewCount)}</span>
                                    <span className="text-gray-500">CTR</span>
                                </div>
                            </div>

                            {/* Dates */}
                            {(ad.startDate || ad.endDate) && (
                                <div className="text-xs text-gray-500">
                                    {ad.startDate && `Du ${new Date(ad.startDate).toLocaleDateString()}`}
                                    {ad.endDate && ` au ${new Date(ad.endDate).toLocaleDateString()}`}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => handleToggleActive(ad.id, ad.isActive)}
                                    disabled={loading === ad.id}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {ad.isActive ? 'Désactiver' : 'Activer'}
                                </button>

                                <button
                                    onClick={() => router.push(`/admin/ads/${ad.id}/edit`)}
                                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Modifier
                                </button>

                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    disabled={loading === ad.id}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {ads.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg font-bold">Aucune publicité</p>
                    <p className="text-sm mt-2">Créez votre première publicité pour commencer</p>
                </div>
            )}
        </div>
    )
}
