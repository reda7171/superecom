import { Link } from '@/i18n/routing'
import { BookOpen } from 'lucide-react'
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');
    const tNav = useTranslations('Navigation');
    const tTrack = useTranslations('Tracking');

    return (
        <footer className="bg-black text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                riwaya<span className="text-gray-600">.</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                            {t('Slogan')}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">{t('Navigation')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/books" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{tNav('Books')}</Link></li>
                            <li><Link href="/packs" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{tNav('Packs')}</Link></li>
                            <li><Link href="/about" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('About')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">{t('Support')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/faq" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('Shipping')}</Link></li>
                            <li><Link href="/returns" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('Returns')}</Link></li>
                            <li><Link href="/tracking" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{tTrack('Title')}</Link></li>
                            <li><Link href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-tight">{t('Contact')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">{t('Journal')}</h3>
                        <p className="text-gray-500 text-sm font-medium mb-4">{t('NewsletterText')}</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-gray-900 border-none rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-white outline-none w-full" />
                            <button className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase">{t('Join')}</button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
                    <p>© 2026 riwaya world. {t('Rights')}</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t('Privacy')}</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">{t('Terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
