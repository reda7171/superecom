'use client'

import { useState } from 'react'
import { ReadingStatus } from '@prisma/client'
import { updateReadingProgress, removeFromReadingList } from '@/lib/actions/reading-list'
import Image from 'next/image'
import { MoreHorizontal, Trash2, CheckCircle, BookOpen, Clock, Book } from 'lucide-react'
import { useUIStore } from '@/store/ui'

import { useTranslations } from 'next-intl'
import { normalizeImage } from '@/lib/utils'
import GenerateReadingCard from './GenerateReadingCard'

interface ReadingListBoardProps {
    initialItems: any[]
    user: any
    children?: React.ReactNode
}

const statusConfig = {
    [ReadingStatus.TO_READ]: { icon: Clock, color: 'bg-gray-100 text-gray-600' },
    [ReadingStatus.READING]: { icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
    [ReadingStatus.COMPLETED]: { icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    [ReadingStatus.ON_HOLD]: { icon: MoreHorizontal, color: 'bg-yellow-100 text-yellow-600' },
    [ReadingStatus.DROPPED]: { icon: Trash2, color: 'bg-red-100 text-red-600' }
}

export default function ReadingListBoard({ initialItems, user, children }: ReadingListBoardProps) {
    const t = useTranslations('Community.ReadingList')
    const [items, setItems] = useState(initialItems)
    const [activeTab, setActiveTab] = useState<ReadingStatus>(ReadingStatus.READING)
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
        if (!confirm(t('Board.ConfirmDelete'))) return
        setItems(prev => prev.filter(item => item.id !== id))
        await removeFromReadingList(id)
    }

    const renderColumn = (status: ReadingStatus) => {
        const columnItems = items.filter(item => item.status === status)
        const { icon: Icon, color } = statusConfig[status]
        const label = t(`Status.${status}`)

        return (
            <div className="flex flex-col gap-4 w-full md:min-w-[300px] flex-1">
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
                                    {(() => {
                                        const rawImage = item.cover || item.book?.image;
                                        const normalized = normalizeImage(rawImage);
                                        const isPlaceholder = normalized === '/book-placeholder.png';
                                        
                                        return !isPlaceholder ? (
                                            <Image
                                                src={normalized}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50/50">
                                                <Book className="w-8 h-8 text-blue-200" />
                                                <span className="text-[8px] font-black text-blue-300 mt-1 uppercase tracking-widest">Perso</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate" title={item.title}>{item.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{item.author}</p>

                                    {/* Progress Bar */}
                                    {(() => {
                                        const progress = item.totalPages > 0 ? Math.min((item.currentPage / item.totalPages) * 100, 100) : 0;
                                        return (
                                            <>
                                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                                    <div
                                                        className="bg-emerald-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-500 mb-3">
                                                    <span>{Math.round(progress)}%</span>
                                                    <span>{item.currentPage}/{item.totalPages} p.</span>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    {/* Actions */}
                                    <div className="flex gap-2 justify-end">
                                        {status !== ReadingStatus.READING && (
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, ReadingStatus.READING)}
                                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium"
                                                title={t('Board.Read')}
                                            >
                                                {t('Board.Read')}
                                            </button>
                                        )}
                                        {status !== ReadingStatus.COMPLETED && (
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, ReadingStatus.COMPLETED)}
                                                className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg"
                                                title={t('Board.MarkFinished')}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                                            title={t('Board.Delete')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Update pages input if reading */}
                            {status === ReadingStatus.READING && (
                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{t('Board.CurrentPage')}</span>
                                    <input
                                        type="number"
                                        value={item.currentPage}
                                        onChange={(e) => handleUpdateProgress(item.id, parseInt(e.target.value) || 0)}
                                        className="w-16 p-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        max={item.totalPages}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {columnItems.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs">
                            {t('Board.Empty')}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Navigation Tabs (All Screens) */}
            <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1.5 backdrop-blur-sm sticky top-4 z-10 shadow-sm border border-white/50">
                {[ReadingStatus.TO_READ, ReadingStatus.READING, ReadingStatus.COMPLETED].map((status) => {
                    const { icon: Icon } = statusConfig[status];
                    const isActive = activeTab === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setActiveTab(status)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                                isActive 
                                    ? 'bg-white text-black shadow-lg shadow-black/5 scale-[1.02]' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className="hidden sm:inline">{t(`Status.${status}`)}</span>
                            <span className="sm:hidden">{t(`Status.${status}`).split(' ')[0]}</span>
                        </button>
                    )
                })}
            </div>

            {/* Card Generation Section */}
            <GenerateReadingCard user={user} items={items} />

            {/* Manual Add Button/Form */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                {children}
            </div>

            {/* Desktop Board / Mobile Active Column */}
            <div className="flex flex-col md:flex-row gap-6 items-start pb-10">
                <div className={`${activeTab === ReadingStatus.TO_READ ? 'flex' : 'hidden md:flex'} flex-col w-full`}>
                    {renderColumn(ReadingStatus.TO_READ)}
                </div>
                <div className={`${activeTab === ReadingStatus.READING ? 'flex' : 'hidden md:flex'} flex-col w-full`}>
                    {renderColumn(ReadingStatus.READING)}
                </div>
                <div className={`${activeTab === ReadingStatus.COMPLETED ? 'flex' : 'hidden md:flex'} flex-col w-full`}>
                    {renderColumn(ReadingStatus.COMPLETED)}
                </div>
            </div>
        </div>
    )
}
