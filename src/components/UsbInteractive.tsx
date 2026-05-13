'use client'

import { useState, useEffect } from 'react'
import { Play, X } from 'lucide-react'

/* Données passées en props depuis le Server Component */
export interface VideoSerie {
    id: number
    title: string
    category: string
    episodes: number
    duration: string
    description: string
    thumbnail: string
    videoUrl: string
    color: string
    bg: string
}

interface Props {
    videoSeries?: VideoSerie[]
    menuItems?: any[]
}

/* ================================================================
   Bouton Back to Top
================================================================ */
function BackToTop() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 400)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!show) return null

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-[9999] w-12 h-12 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform back-top-btn"
            style={{ backgroundColor: '#FF6B6B' }}
            aria-label="Retour en haut"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
        </button>
    )
}

/* ================================================================
   Bouton Play + Modal vidéo
================================================================ */
export function VideoPlayButton({ serie }: { serie: VideoSerie }) {
    const [active, setActive] = useState(false)

    return (
        <>
            <button
                onClick={() => setActive(true)}
                className="absolute inset-0 flex items-center justify-center group/play"
                aria-label={`Aperçu ${serie.title}`}
            >
                <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-1" style={{ color: serie.color }} />
                </div>
            </button>

            {active && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setActive(false)}
                >
                    <div
                        className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActive(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="aspect-video bg-black flex items-center justify-center">
                            <div className="text-center text-white p-8">
                                <div className="text-6xl mb-4">▶</div>
                                <h3 className="text-2xl font-black mb-2">{serie.title}</h3>
                                <p className="text-white/70">{serie.description}</p>
                                <p className="mt-4 text-sm text-white/50">Vidéo disponible sur la clé USB</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

/* ================================================================
   Hero preview button (ouvre le premier aperçu vidéo)
================================================================ */
export function HeroPreviewButton({ serie }: { serie: VideoSerie }) {
    const [active, setActive] = useState(false)

    return (
        <>
            <button
                onClick={() => setActive(true)}
                className="px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-lg hover:border-orange-300 hover:text-orange-600 transition-all flex items-center gap-2"
            >
                <Play className="w-5 h-5" /> Voir un aperçu
            </button>

            {active && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setActive(false)}
                >
                    <div
                        className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActive(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
                            <div className="text-center text-white p-8">
                                <div className="text-6xl mb-4">▶</div>
                                <h3 className="text-2xl font-black mb-2">{serie.title}</h3>
                                <p className="text-white/70">{serie.description}</p>
                                <p className="mt-4 text-sm text-white/50">Aperçu disponible sur la clé USB</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

import UsbStickyMenu from './UsbStickyMenu'

/* ================================================================
   Export composant principal (regroupe Back to Top et Sticky Menu)
 ================================================================ */
export default function UsbInteractive({ menuItems }: Props) {
    return (
        <>
            <BackToTop />
            <UsbStickyMenu items={menuItems} />
        </>
    )
}
