'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { deletePack, togglePackStatus } from '@/lib/actions/packs'

interface Pack {
    id: string
    name: string
    price: number
    image: string | null
    active: boolean
    books: Array<{
        book: {
            id: string
            title: string
            author: string
            image: string
        }
    }>
}

export default function PacksTable({ packs }: { packs: Pack[] }) {
    const [loading, setLoading] = useState<string | null>(null)

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

    if (packs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Aucun pack trouvé</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Pack
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Livres Inclus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {packs.map((pack) => (
                        <tr key={pack.id} className="hover:bg-gray-50">
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
                                        <div className="text-sm font-medium text-gray-900">{pack.name}</div>
                                        <div className="text-sm text-gray-500">{pack.books.length} livre{pack.books.length > 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {pack.books.slice(0, 3).map((pb) => (
                                        <span
                                            key={pb.book.id}
                                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
                                        >
                                            {pb.book.title}
                                        </span>
                                    ))}
                                    {pack.books.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700">
                                            +{pack.books.length - 3}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {pack.price} MAD
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleToggleStatus(pack.id, pack.active)}
                                    disabled={loading === pack.id}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pack.active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        } hover:opacity-80`}
                                >
                                    {pack.active ? (
                                        <>
                                            <Eye className="w-3 h-3 mr-1" />
                                            Actif
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            Inactif
                                        </>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/packs/${pack.id}/edit`}
                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(pack.id, pack.name)}
                                        disabled={loading === pack.id}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
