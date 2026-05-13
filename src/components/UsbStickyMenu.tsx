'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Usb, Play, HelpCircle, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function UsbStickyMenu({ items }: { items?: any[] }) {
    const t = useTranslations('UsbPage')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }
        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollTo = (id: string) => {
        const element = document.getElementById(id.replace('#', ''))
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Si on a des items de la DB, on les utilise, sinon on garde le comportement par défaut
    const navItems = items && items.length > 0 ? items : [
        { label: 'StickyMenu.Catalog', url: '#videos', type: 'scroll', icon: Play, colorClass: 'text-orange-400', hoverBg: 'hover:bg-orange-50', hoverText: 'group-hover:text-orange-600' },
        { label: 'StickyMenu.Guide', url: '#how-it-works', type: 'scroll', icon: HelpCircle, colorClass: 'text-teal-400', hoverBg: 'hover:bg-teal-50', hoverText: 'group-hover:text-teal-600' }
    ]

    const ctaItem = items?.find(i => i.url.includes('/commander')) || { label: 'BtnOrder', url: '/cle-usb/commander' }

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(255,107,107,0.25)] p-2 flex items-center gap-1 md:gap-4 ring-1 ring-black/5">
                
                {/* Desktop Quick Links */}
                <div className="hidden md:flex items-center gap-1 pl-4 pr-2">
                    {navItems.filter(i => !i.url.includes('/commander')).map((item: any, idx: number) => (
                        <div key={item.url} className="flex items-center">
                            {idx > 0 && <div className="w-1.5 h-1.5 rounded-full bg-gray-100 mx-1" />}
                            <button 
                                onClick={() => item.url.startsWith('#') ? scrollTo(item.url) : null}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-full transition-all group ${item.hoverBg || 'hover:bg-gray-50'}`}
                            >
                                {item.icon ? <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.colorClass}`} /> : (
                                    item.url.includes('videos') ? <Play className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" /> : <HelpCircle className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 transition-colors ${item.hoverText || 'group-hover:text-black'}`}>
                                    {t(item.label as any).split('—')[0]}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Mobile Icons */}
                <div className="md:hidden flex items-center pl-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                         <Star className="w-5 h-5 text-orange-400 animate-pulse" />
                    </div>
                </div>

                {/* Main CTA */}
                <Link 
                    href={ctaItem.url}
                    className="flex items-center gap-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white px-8 md:px-10 py-4 rounded-full font-black text-xs md:text-sm uppercase tracking-[0.15em] shadow-[0_10px_20px_-5px_rgba(255,107,107,0.4)] transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_15px_30px_-5px_rgba(255,107,107,0.5)] group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                    <Usb className="w-4 h-4 md:w-5 h-5" />
                    <span className="relative z-10">{t(ctaItem.label as any).split('—')[0]}</span>
                </Link>
            </div>
        </div>
    )
}
