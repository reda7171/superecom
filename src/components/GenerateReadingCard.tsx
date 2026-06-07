'use client'

import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { Share2, Download, Loader2, Award, BookOpen, Clock, Users } from 'lucide-react'
import Image from 'next/image'
import { normalizeImage } from '@/lib/utils'
import { getUserReadingRank } from '@/lib/actions/reading-rank'

interface GenerateReadingCardProps {
    user: any
    items: any[]
}

export default function GenerateReadingCard({ user, items }: GenerateReadingCardProps) {
    const [generating, setGenerating] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [rank, setRank] = useState<number | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    const totalBooks = items.length
    const completedBooks = items.filter(i => i.status === 'COMPLETED').length
    const totalPages = items.reduce((acc, i) => acc + i.totalPages, 0)
    const pagesRead = items.reduce((acc, i) => acc + i.currentPage, 0)
    const uniqueAuthors = new Set(items.map(i => i.author)).size
    // Estimation : 1 page = 1.5 min
    const hoursRead = Math.round((pagesRead * 1.5) / 60)

    const handleGenerate = async () => {
        setGenerating(true)
        setShowPreview(true)

        // Wait for potential rank fetch or just a small delay for rendering
        const userRank = await getUserReadingRank()
        setRank(userRank)

        setTimeout(async () => {
            if (cardRef.current) {
                try {
                    // Force rendering of all elements
                    const dataUrl = await toPng(cardRef.current, {
                        cacheBust: true,
                        pixelRatio: 1, // Set to 1 for better compatibility
                        backgroundColor: '#ffffff',
                        skipFonts: false,
                    })
                    const link = document.createElement('a')
                    link.download = `superEcom-challenge-${user?.fullName || 'reader'}.png`
                    link.href = dataUrl
                    link.click()
                } catch (err) {
                    console.error('Error generating image', err)
                } finally {
                    setGenerating(false)
                }
            }
        }, 1500) // Increased delay to ensure rendering
    }

    if (!user) return null

    return (
        <div className="mt-4">
            <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
            >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                Générer ma carte de lecteur
            </button>

            {/* Hidden Card for Generation (or visible preview) */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all ${showPreview ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="relative max-w-md w-full">
                    <button
                        onClick={() => setShowPreview(false)}
                        className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full"
                    >
                        Fermer
                    </button>

                    <div 
                        ref={cardRef}
                        className="bg-white rounded-[40px] overflow-hidden shadow-2xl border-8 border-white relative"
                        style={{ width: '408px', height: '725px' }} // Exact 9:16 ratio for 408px width
                    >
                        {/* Background Design */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 z-0" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                                        <span className="text-white font-black text-xl italic">R</span>
                                    </div>
                                    <div>
                                        <h2 className="font-black text-lg leading-tight">SuperEcom</h2>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Community</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Lecteur Passionné
                                </div>
                            </div>

                            {/* User Profile */}
                            <div className="flex flex-col items-center py-6">
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="absolute inset-0 bg-emerald-600 rounded-full animate-pulse opacity-20 scale-110" />
                                    <div className="relative w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                                        {user.image ? (
                                            <Image 
                                                src={normalizeImage(user.image)} 
                                                alt={user.fullName} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                <Users className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                        <Award className="w-6 h-6 text-yellow-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-center text-black">{user.fullName}</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{user.city || 'Maroc'}</p>
                            </div>

                            {/* Stats Grid - 6 Cards for a complete overview */}
                            <div className="flex flex-wrap gap-3">
                                <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 shadow-sm w-[calc(50%-6px)]">
                                    <BookOpen className="w-4 h-4 text-emerald-600 mb-1" />
                                    <div className="text-xl font-black text-black">{totalBooks}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500">Livres</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-3xl border border-green-100 shadow-sm w-[calc(50%-6px)]">
                                    <Award className="w-4 h-4 text-green-600 mb-1" />
                                    <div className="text-xl font-black text-black">{completedBooks}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500">Terminés</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 shadow-sm w-[calc(50%-6px)]">
                                    <Clock className="w-4 h-4 text-blue-600 mb-1" />
                                    <div className="text-xl font-black text-black">{hoursRead}h</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500">Temps total</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 shadow-sm w-[calc(50%-6px)]">
                                    <div className="text-orange-600 font-black text-xs mb-1 font-sans">PP</div>
                                    <div className="text-xl font-black text-black">{totalPages.toLocaleString()}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500">Pages</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-3xl border border-purple-100 shadow-sm w-[calc(50%-6px)]">
                                    <Users className="w-4 h-4 text-purple-600 mb-1" />
                                    <div className="text-xl font-black text-black">{uniqueAuthors}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-500">Auteurs</div>
                                </div>
                                <div className="bg-black text-white p-4 rounded-3xl shadow-lg w-[calc(50%-6px)]">
                                    <div className="text-yellow-400 font-black text-xs mb-1 font-sans tracking-tight">RANG</div>
                                    <div className="text-xl font-black">#{rank || '?'}</div>
                                    <div className="text-[10px] uppercase font-bold text-white/60">Communauté</div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Challenge</div>
                                    <div className="text-xl font-black text-emerald-600 tracking-tighter">#RiwayaChallenge</div>
                                </div>
                                <div className="bg-black text-white px-5 py-2.5 rounded-2xl font-black text-sm">
                                    superEcom.com
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                        >
                            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            Télécharger l'image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
