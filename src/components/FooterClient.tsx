'use client'

import { Link } from '@/i18n/routing'
import { BookOpen, Instagram, Linkedin, Facebook, Twitter, ArrowUp, Youtube, AtSign } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface FooterProps {
    features?: {
        seller?: boolean
        exchange?: boolean
        usb?: boolean
        kids?: boolean
        readingList?: boolean
    }
    siteLogo?: string | null
    socials?: {
        instagram?: string | null
        facebook?: string | null
        linkedin?: string | null
        twitter?: string | null
        youtube?: string | null
        threads?: string | null
    }
}

export default function FooterClient({ features = {}, siteLogo = null, socials = {} }: FooterProps = {}) {
    const t = useTranslations('Footer');
    const tNav = useTranslations('Navigation');
    const tTrack = useTranslations('Tracking');

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-black text-white relative">
            {/* Top Bar with Back to Top */}
            <div className="bg-black border-b border-white/5 h-16 w-full flex items-center ltr:justify-end rtl:justify-start px-4 sm:px-6 lg:px-8">
                <button
                    onClick={scrollToTop}
                    className="group bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                    <ArrowUp className="w-4 h-4 text-black" />
                    {t('BackToTop')}
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative">
                {/* Vertical Social Sidebar */}
                <div className="absolute ltr:right-4 sm:ltr:-right-16 rtl:left-4 sm:rtl:-left-16 top-32 z-10 hidden xl:flex">
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full py-6 px-3 flex flex-col gap-6 shadow-2xl">
                        {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Instagram" className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-90"><Instagram className="w-5 h-5" /></a>}
                        {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur LinkedIn" className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-90"><Linkedin className="w-5 h-5" /></a>}
                        {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Facebook" className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-90"><Facebook className="w-5 h-5" /></a>}
                        {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Twitter" className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-90"><Twitter className="w-5 h-5" /></a>}
                        {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur YouTube" className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-90"><Youtube className="w-5 h-5" /></a>}
                        {socials.threads && <a href={socials.threads} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Threads" className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-90"><AtSign className="w-5 h-5" /></a>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            {siteLogo ? (
                                <img 
                                    src={siteLogo} 
                                    alt="Riwaya Logo" 
                                    className="h-8 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <>
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-black" />
                                    </div>
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        riwaya<span className="text-[#10b981]">.</span>
                                    </span>
                                </>
                            )}
                        </Link>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-xs">
                            {t('Slogan')}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-8">{t('Navigation')}</h3>
                        <ul className="space-y-4" suppressHydrationWarning>
                            <li suppressHydrationWarning>
                                <Link href="/books" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight" suppressHydrationWarning>{tNav('Books')}</Link>
                            </li>
                            <li suppressHydrationWarning>
                                <Link href="/packs" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight" suppressHydrationWarning>{tNav('Packs')}</Link>
                            </li>
                            <li suppressHydrationWarning>
                                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight" suppressHydrationWarning>{t('About')}</Link>
                            </li>
                            {features.exchange === true && (
                                <li suppressHydrationWarning>
                                    <Link href="/community/market" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight" suppressHydrationWarning>{tNav('Community')}</Link>
                                </li>
                            )}
                            {features.seller === true && (
                                <li suppressHydrationWarning>
                                    <Link href="/devenir-vendeur" className="text-pixio-yellow hover:text-white transition-colors text-sm font-black tracking-tight inline-flex items-center gap-2 group" suppressHydrationWarning>
                                        Devenir vendeur
                                        <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">✨</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-8">{t('Support')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/shipping-policy" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('Shipping')}</Link></li>
                            <li><Link href="/return-policy" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('Returns')}</Link></li>
                            <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight">Confidentialité</Link></li>
                            <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight">Conditions</Link></li>
                            <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('Contact')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-8">{t('Journal')}</h3>
                        <ul className="space-y-4 mb-8">
                            <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm font-bold tracking-tight">{tNav('Journal')}</Link></li>
                        </ul>
                        <p className="text-gray-300 text-sm font-medium mb-4">{t('NewsletterText')}</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-gray-900 border-none rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-white outline-none w-full font-bold text-white placeholder-gray-600" />
                            <button className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-gray-200 transition-all active:scale-95">{t('Join')}</button>
                        </div>
                    </div>
                </div>

                {/* Mobile Socials */}
                <div className="flex xl:hidden gap-6 mb-12 justify-center">
                    {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Instagram" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
                    {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur LinkedIn" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>}
                    {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Facebook" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
                    {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Twitter" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
                    {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur YouTube" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>}
                    {socials.threads && <a href={socials.threads} target="_blank" rel="noopener noreferrer" aria-label="Riwaya sur Threads" className="text-gray-400 hover:text-white transition-colors"><AtSign className="w-5 h-5" /></a>}
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-300 relative">
                    <p>© 2026 riwaya world. {t('Rights')}</p>

                    <div className="md:absolute md:left-1/2 md:-translate-x-1/2 text-center">
                        <p className="hover:text-white transition-colors cursor-default">
                            {t.rich('DevelopedBy', {
                                name: (chunks) => (
                                    <a
                                        href="https://instagram.com/itsmereda1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white font-bold hover:text-pixio-yellow transition-colors"
                                    >
                                        {chunks}
                                    </a>
                                )
                            })}
                        </p>
                    </div>

                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">{t('Privacy')}</Link>
                        <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">{t('Terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
