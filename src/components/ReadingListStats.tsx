'use client'

import { BookOpen, BookCheck, Users, ScrollText, GraduationCap } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ReadingListStatsProps {
    items: any[]
}

export default function ReadingListStats({ items }: ReadingListStatsProps) {
    const t = useTranslations('Community.ReadingList.Stats')
    const totalBooks = items.length
    const completedBooks = items.filter(i => i.status === 'COMPLETED').length
    const uniqueAuthors = new Set(items.map(i => i.author)).size
    const totalPages = items.reduce((acc, i) => acc + i.totalPages, 0)
    const pagesRead = items.reduce((acc, i) => acc + i.currentPage, 0)
    const readingProgress = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0

    const stats = [
        {
            label: t('Library'),
            value: totalBooks,
            subValue: t('Completed', { count: completedBooks }),
            icon: BookOpen,
            color: 'bg-black text-white hover:bg-gray-900 border-black'
        },
        {
            label: t('Authors'),
            value: uniqueAuthors,
            subValue: t('Explored'),
            icon: Users,
            color: 'bg-white text-black hover:bg-gray-50 border-gray-100 shadow-sm'
        },
        {
            label: t('TotalVolume'),
            value: totalPages.toLocaleString(),
            subValue: t('PagesAccumulated'),
            icon: ScrollText,
            color: 'bg-white text-black hover:bg-gray-50 border-gray-100 shadow-sm'
        },
        {
            label: t('Progress'),
            value: `${readingProgress}%`,
            subValue: t('PagesRead', { count: pagesRead.toLocaleString() }),
            icon: GraduationCap,
            color: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
        }
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                    <div
                        key={idx}
                        className={`p-6 rounded-3xl border transition-all duration-300 group cursor-default ${stat.color}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl border ${stat.color === 'bg-black text-white hover:bg-gray-900 border-black' ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors'}`}>
                                <Icon className={`w-5 h-5 ${stat.color.includes('text-white') ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-2xl font-black tracking-tight" suppressHydrationWarning>{stat.value}</h4>
                            <div className="flex flex-col">
                                <span className={`text-[10px] uppercase font-black tracking-widest ${stat.color.includes('text-white') ? 'text-white/60' : 'text-gray-400'}`}>
                                    {stat.label}
                                </span>
                                <span
                                    className={`text-[10px] font-bold ${stat.color.includes('text-white') ? 'text-white/40' : 'text-gray-300'}`}
                                    suppressHydrationWarning
                                >
                                    {stat.subValue}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
