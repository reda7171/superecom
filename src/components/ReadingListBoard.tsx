'use client'

import { useState } from 'react'
import { ReadingStatus } from '@prisma/client'
import { updateReadingProgress, removeFromReadingList } from '@/lib/actions/reading-list'
import Image from 'next/image'
import { MoreHorizontal, Trash2, CheckCircle, BookOpen, Clock } from 'lucide-react'
import { useUIStore } from '@/store/ui'

interface ReadingListBoardProps {
    initialItems: any[]
}

const statusMap = {
    [ReadingStatus.TO_READ]: { label: 'À lire', icon: Clock, color: 'bg-gray-100 text-gray-600' },
    [ReadingStatus.READING]: { label: 'En cours', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    [ReadingStatus.COMPLETED]: { label: 'Terminé', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    [ReadingStatus.ON_HOLD]: { label: 'En pause', icon: MoreHorizontal, color: 'bg-yellow-100 text-yellow-600' },
    [ReadingStatus.DROPPED]: { label: 'Abandonné', icon: Trash2, color: 'bg-red-100 text-red-600' }
}

export default function ReadingListBoard({ initialItems }: ReadingListBoardProps) {
    const [items, setItems] = useState(initialItems)
    const { showNotification } = useUIStore()

    const handleUpdateStatus = async (id: string, newStatus: ReadingStatus) => {
        // Optimistic update
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item))

        const result = await updateReadingProgress({ id, currentPage: 0, status: newStatus })
        if (!result.success) {
            showNotification('Erreur lors de la mise à jour', 'error')
            // Revert
            setItems(initialItems)
        }
    }

    const handleUpdateProgress = async (id: string, currentPage: number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, currentPage } : item))
        // Debounce actual API call in real app, here direct call for simplicity
        await updateReadingProgress({ id, currentPage })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr ?')) return
        setItems(prev => prev.filter(item => item.id !== id))
        await removeFromReadingList(id)
    }

    const renderColumn = (status: ReadingStatus) => {
        const columnItems = items.filter(item => item.status === status)
        const { label, icon: Icon, color } = statusMap[status]

        return (
            <div className="flex flex-col gap-4 min-w-[300px] flex-1">
                <div className={`flex items-center gap-2 p-3 rounded-xl font-bold ${color}`}>
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                    <span className="ml-auto bg-white/50 px-2 py-0.5 rounded text-xs">{columnItems.length}</span>
                </div>

                <div className="flex flex-col gap-4">
                    {columnItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                                <div className="relative w-16 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    {item.cover || item.book?.image ? (
                                        <Image
                                            src={item.cover || item.book.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate" title={item.title}>{item.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{item.author}</p>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min((item.currentPage / item.totalPages) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-3">
                                        <span>{Math.round((item.currentPage / item.totalPages) * 100)}%</span>
                                        <span>{item.currentPage}/{item.totalPages} p.</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 justify-end">
                                        {status !== ReadingStatus.READING && (
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, ReadingStatus.READING)}
                                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                                                title="Commencer / Continuer"
                                            >
                                                Lire
                                            </button>
                                        )}
                                        {status !== ReadingStatus.COMPLETED && (
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, ReadingStatus.COMPLETED)}
                                                className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg"
                                                title="Marquer comme terminé"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Update pages input if reading */}
                            {status === ReadingStatus.READING && (
                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Page actuelle :</span>
                                    <input
                                        type="number"
                                        value={item.currentPage}
                                        onChange={(e) => handleUpdateProgress(item.id, parseInt(e.target.value) || 0)}
                                        className="w-16 p-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        max={item.totalPages}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {columnItems.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs">
                            Vide
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 items-start">
            {renderColumn(ReadingStatus.TO_READ)}
            {renderColumn(ReadingStatus.READING)}
            {renderColumn(ReadingStatus.COMPLETED)}
        </div>
    )
}
