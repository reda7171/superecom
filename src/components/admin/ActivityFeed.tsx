'use client'

import { useState } from 'react'
import { Search, Globe, User, Link as LinkIcon, Clock } from 'lucide-react'

interface PageView {
    id: string
    url: string
    referrer: string | null
    sessionId: string | null
    createdAt: Date | string
    city?: string | null
    country?: string | null
    device?: string | null
    user?: {
        fullName: string
        email: string
    } | null
}

interface ActivityFeedProps {
    initialActivity: PageView[]
}

export default function ActivityFeed({ initialActivity }: ActivityFeedProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredActivity = initialActivity.filter(view => {
        const search = searchTerm.toLowerCase()
        const urlMatch = view.url.toLowerCase().includes(search)
        const userMatch = view.user?.fullName.toLowerCase().includes(search) || 
                         view.user?.email.toLowerCase().includes(search)
        const referrerMatch = view.referrer?.toLowerCase().includes(search)
        const sessionMatch = view.sessionId?.toLowerCase().includes(search)
        const cityMatch = view.city?.toLowerCase().includes(search)
        const countryMatch = view.country?.toLowerCase().includes(search)
        const deviceMatch = view.device?.toLowerCase().includes(search)
        
        return urlMatch || userMatch || referrerMatch || sessionMatch || cityMatch || countryMatch || deviceMatch
    })

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return 'Direct'
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-bold text-gray-800">Flux d'activité en temps réel</h2>
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase">
                        {filteredActivity.length} entrées
                    </span>
                </div>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher (URL, User, Source...)"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 text-center">
                        <tr>
                            <th className="px-6 py-4 text-left">Page Vue</th>
                            <th className="px-6 py-4">Utilisateur / Session</th>
                            <th className="px-6 py-4">Source (Referrer)</th>
                            <th className="px-6 py-4 text-right">Moment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredActivity.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                    Aucun résultat correspondant à votre recherche.
                                </td>
                            </tr>
                        ) : (
                            filteredActivity.map((view) => (
                                <tr key={view.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 max-w-[250px]">
                                        <a 
                                            href={view.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 group/link"
                                        >
                                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-mono text-[11px] text-blue-600 truncate group-hover/link:underline" title={view.url}>
                                                {view.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                                            </span>
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            {view.user ? (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-[11px] font-bold">
                                                    <User className="w-3 h-3" />
                                                    {view.user.fullName}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-gray-400 text-xs font-medium">Anonyme</span>
                                                    <span className="text-[10px] text-gray-300 font-mono tracking-tighter">
                                                        ID: {view.sessionId?.slice(0, 8)}...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            {view.referrer && view.referrer.startsWith('http') ? (
                                                <a 
                                                    href={view.referrer} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                                                >
                                                    {getHostname(view.referrer)}
                                                </a>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gray-100 text-gray-500">
                                                    {view.referrer ? getHostname(view.referrer) : 'Direct'}
                                                </span>
                                            )}
                                            {view.referrer && (
                                                <span className="text-[9px] text-gray-400 truncate max-w-[120px] mt-1" title={view.referrer}>
                                                    {view.referrer}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 text-gray-600 font-black text-[11px]">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                {new Date(view.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                            <span className="text-[9px] text-gray-400">
                                                {new Date(view.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
