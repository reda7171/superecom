'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { X, Cookie, ShieldCheck, Settings2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const t = useTranslations('CookieConsent')
    const pathname = usePathname()

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent')
        // Robust check for admin pages (handles /admin, /fr/admin, /ar/admin etc)
        const isAdminPage = pathname?.split('/').some(segment => segment === 'admin')

        if (!consent && !isAdminPage) {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1500) // Slight delay for better UX
            return () => clearTimeout(timer)
        }
    }, [pathname])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[9999] animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-1">
                {/* Subtle Gradient Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-black/5 rounded-full blur-3xl"></div>
                
                <div className="relative bg-white/50 rounded-[2.2rem] p-8">
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-6 right-6 text-gray-300 hover:text-black transition-all hover:rotate-90 duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
                                <Cookie className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase tracking-[0.2em] text-black">
                                    {t('Title')}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <ShieldCheck className="w-3 h-3 text-gray-400" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Privacy Secured</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
                                {t.rich('Description', {
                                    link: (chunks) => (
                                        <Link href="/privacy" className="text-black font-bold underline underline-offset-4 decoration-1 hover:decoration-2 transition-all">
                                            {chunks}
                                        </Link>
                                    )
                                })}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button 
                                    onClick={handleAccept}
                                    className="flex-1 px-8 py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/5"
                                >
                                    {t('Accept')}
                                </button>
                                <button 
                                    onClick={handleDecline}
                                    className="flex-1 px-8 py-4 border border-gray-200 text-black text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    {t('LearnMore')}
                                </button>
                            </div>
                            
                            <div className="flex justify-center">
                                <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2">
                                    <Settings2 className="w-3 h-3" />
                                    Preference Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
