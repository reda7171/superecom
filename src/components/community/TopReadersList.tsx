'use client'

import { TopReader } from '@/lib/actions/community'
import { Crown, BookOpen, MapPin } from 'lucide-react'

interface TopReadersListProps {
    readers: TopReader[]
    title: string
    subtitle?: string
}

export default function TopReadersList({ readers, title, subtitle }: TopReadersListProps) {
    if (!readers || readers.length === 0) return null

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-50 to-transparent rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none" />

            <div className="relative mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-yellow-100 rounded-2xl rotate-3 shadow-sm shadow-yellow-100">
                        <Crown className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-sm font-medium text-gray-400">{subtitle}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3 relative">
                {readers.map((reader, index) => {
                    const isTop1 = index === 0
                    const isTop2 = index === 1
                    const isTop3 = index === 2

                    return (
                        <div
                            key={reader.id}
                            className={`group/item flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border
                                ${isTop1 ? 'bg-gradient-to-r from-yellow-50/80 to-white border-yellow-100 shadow-yellow-100/50' :
                                    isTop2 ? 'bg-gradient-to-r from-gray-50/80 to-white border-gray-100' :
                                        isTop3 ? 'bg-gradient-to-r from-orange-50/80 to-white border-orange-100' :
                                            'bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50'}
                                hover:shadow-lg`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 relative overflow-hidden transition-transform group-hover/item:rotate-12
                                    ${isTop1 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' :
                                        isTop2 ? 'bg-gray-300 text-white shadow-lg shadow-gray-200' :
                                            isTop3 ? 'bg-orange-400 text-white shadow-lg shadow-orange-200' :
                                                'text-gray-400 bg-gray-100'
                                    }`}>
                                    <span className="relative z-10">{index + 1}</span>
                                    {isTop1 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                </div>

                                <div className="relative w-12 h-12 rounded-full p-0.5 bg-white shadow-sm shrink-0">
                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                        {reader.image ? (
                                            <img
                                                src={reader.image}
                                                alt={reader.fullName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-black text-xs uppercase">
                                                {reader.fullName.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                    {isTop1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white shadow-sm">
                                            <Crown className="w-2 h-2 fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-base text-gray-900 truncate max-w-[140px] group-hover/item:text-blue-600 transition-colors">
                                        {reader.fullName}
                                    </h3>
                                    {reader.city && (
                                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-gray-300 group-hover/item:text-blue-400 transition-colors" /> {reader.city}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all
                                    ${isTop1 ? 'bg-yellow-100 text-yellow-700 group-hover/item:bg-yellow-500 group-hover/item:text-white' :
                                        'bg-gray-100 text-gray-600 group-hover/item:bg-black group-hover/item:text-white'}`}>
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{reader.readCount}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
