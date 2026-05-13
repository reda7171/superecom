'use client'

import { deleteGift, toggleGiftStatus } from '@/lib/actions/gifts'
import { Trash2, CheckCircle2, XCircle, Power } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function GiftsTable({ gifts }: { gifts: any[] }) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce cadeau ?')) return
        const res = await deleteGift(id)
        if (res.success) router.refresh()
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const res = await toggleGiftStatus(id, !currentStatus)
        if (res.success) router.refresh()
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Cadeau</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Valeur</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Déblocage (Min)</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic font-medium">
                    {gifts.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Aucun cadeau configuré</td>
                        </tr>
                    ) : (
                        gifts.map((gift) => (
                            <tr key={gift.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                            {gift.image ? (
                                                <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Trash2 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-none">{gift.name}</p>
                                            <p className="mt-1 text-xs text-gray-400 line-clamp-1 max-w-[200px]">{gift.description || 'Sans description'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">
                                        {gift.price} MAD
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-bold text-gray-500 text-sm">
                                        {gift.minAmount > 0 ? `${gift.minAmount} MAD` : 'Sans minimum'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {gift.active ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                                            <CheckCircle2 className="w-3 h-3" /> Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                                            <XCircle className="w-3 h-3" /> Inactif
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <button
                                        onClick={() => handleToggle(gift.id, gift.active)}
                                        className={`p-2 rounded-lg transition-colors ${gift.active ? 'text-orange-400 hover:bg-orange-50' : 'text-green-400 hover:bg-green-50'}`}
                                        title={gift.active ? "Désactiver" : "Activer"}
                                    >
                                        <Power className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(gift.id)}
                                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
