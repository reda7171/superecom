'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Edit, Trash2, Eye, EyeOff, Save, Send } from 'lucide-react'
import { deletePack, togglePackStatus } from '@/lib/actions/packs'
import N8nPublishModal from '@/components/admin/N8nPublishModal'

interface Pack {
    id: string
    name: string
    price: number
    image: string | null
    description?: string | null
    active: boolean
    products: Array<{
        product: {
            id: string
            title: string
            author: string
            image: string
        }
    }>
}

export default function PacksTable({ packs }: { packs: Pack[] }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [n8nPack, setN8nPack] = useState<any | null>(null)
    const [n8nFormat, setN8nFormat] = useState<'post' | 'story'>('post')
    const [quickPublishing, setQuickPublishing] = useState<string | null>(null)
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
            return
        }

        setLoading(id)
        const result = await deletePack(id)
        setLoading(null)

        if (!result.success) {
            alert(result.error)
        }
    }

    async function handleToggleStatus(id: string, currentStatus: boolean) {
        setLoading(id)
        const result = await togglePackStatus(id, !currentStatus)
        setLoading(null)

        if (!result.success) {
            alert(result.error)
        }
    }

    // Publication immédiate sans modal
    const handleQuickPublish = async (pack: Pack) => {
        setQuickPublishing(pack.id)
        try {
            const res = await fetch('/api/n8n/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packId: pack.id,
                    format: 'post',
                    platform: 'both',
                    useDescription: 'short',
                    scheduleAt: null
                })
            })
            const data = await res.json()
            if (data.success) {
                setToast({ msg: `✅ Pack "${pack.name}" envoyé à n8n`, ok: true })
                setTimeout(() => setToast(null), 4000)
            } else {
                setToast({ msg: `❌ ${data.error || 'Erreur n8n'}`, ok: false })
                setTimeout(() => setToast(null), 5000)
            }
        } catch {
            setToast({ msg: '❌ Erreur réseau', ok: false })
            setTimeout(() => setToast(null), 5000)
        } finally {
            setQuickPublishing(null)
        }
    }

    if (packs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Aucun pack trouvé</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto relative">
            {/* Toast notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all animate-in slide-in-from-top-2 ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pack
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Livres Inclus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {packs.map((pack) => (
                        <tr key={pack.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    {pack.image && (
                                        <div className="h-16 w-12 flex-shrink-0 relative mr-4">
                                            <Image
                                                src={pack.image}
                                                alt={pack.name}
                                                fill
                                                className="object-cover rounded"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{pack.name}</div>
                                        <div className="text-sm text-gray-500">{pack.products.length} livre{pack.products.length > 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {pack.products.slice(0, 3).map((pb) => (
                                        <Link
                                            key={pb.product.id}
                                            href={`/admin/products/${pb.product.id}/edit`}
                                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-tighter hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                                        >
                                            {pb.product.title}
                                        </Link>
                                    ))}
                                    {pack.products.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-[10px] font-bold text-gray-700">
                                            +{pack.products.length - 3}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                                {pack.price} MAD
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleToggleStatus(pack.id, pack.active)}
                                    disabled={loading === pack.id}
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${pack.active
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        } hover:opacity-80 shadow-sm`}
                                >
                                    {pack.active ? (
                                        <>
                                            <Eye className="w-3 h-3 mr-1.5" />
                                            Actif
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3 mr-1.5" />
                                            Inactif
                                        </>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Boutons n8n */}
                                    <button
                                        onClick={() => { setN8nFormat('post'); setN8nPack({ ...pack, title: pack.name, description: pack.description || `Pack de ${pack.products.length} livres` }); }}
                                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-xl transition-all"
                                        title="Publier / Programmer via n8n (FB/Insta)"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                    </button>
                                    <button
                                        onClick={() => handleQuickPublish(pack)}
                                        disabled={quickPublishing === pack.id}
                                        className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-xl transition-all disabled:opacity-40"
                                        title="Publier maintenant (FB+Insta) sans options"
                                    >
                                        {quickPublishing === pack.id
                                            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                            : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                        }
                                    </button>

                                    <Link
                                        href={`/admin/packs/${pack.id}/edit`}
                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Modifier"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(pack.id, pack.name)}
                                        disabled={loading === pack.id}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <N8nPublishModal
                isOpen={!!n8nPack}
                onClose={() => setN8nPack(null)}
                product={n8nPack}
                format={n8nFormat}
            />
        </div>
    )
}
