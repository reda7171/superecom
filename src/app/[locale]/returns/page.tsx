import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { RotateCcw, ShieldCheck, Clock, MessageCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function ReturnsPage() {
    const t = await getTranslations('Returns');

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            <div className="pt-24 pb-12 bg-pixio-beige relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-pixio-pink/10 rounded-full blur-3xl -translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-black text-xs font-black uppercase tracking-widest shadow-sm border border-gray-100 mb-8">
                        <ShieldCheck className="w-4 h-4 text-pixio-pink" />
                        <span>{t('Subtitle')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-6">{t('Title')}</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">{t('Intro')}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Clock className="w-32 h-32" />
                        </div>
                        <div className="w-12 h-12 bg-pixio-cream rounded-2xl flex items-center justify-center mb-6">
                            <span className="font-black text-xl">1</span>
                        </div>
                        <p className="text-xl font-bold text-black leading-relaxed">
                            {t('Policy.Point1')}
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="w-12 h-12 bg-pixio-cream rounded-2xl flex items-center justify-center mb-6">
                            <span className="font-black text-xl">2</span>
                        </div>
                        <p className="text-xl font-bold text-black leading-relaxed">
                            {t('Policy.Point2')}
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageCircle className="w-32 h-32" />
                        </div>
                        <div className="w-12 h-12 bg-pixio-cream rounded-2xl flex items-center justify-center mb-6">
                            <span className="font-black text-xl">3</span>
                        </div>
                        <p className="text-xl font-bold text-black leading-relaxed">
                            {t('Policy.Point3')}
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <RotateCcw className="w-32 h-32" />
                        </div>
                        <div className="w-12 h-12 bg-pixio-cream rounded-2xl flex items-center justify-center mb-6">
                            <span className="font-black text-xl">4</span>
                        </div>
                        <p className="text-xl font-bold text-black leading-relaxed">
                            {t('Policy.Point4')}
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
