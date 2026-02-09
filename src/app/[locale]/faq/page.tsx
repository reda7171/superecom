import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function FAQPage() {
    const t = await getTranslations('FAQ');

    // Convert translation object to array for mapping
    // Note: In real next-intl, we can iterate over keys or structure the JSON as array
    const questions = ['Shipping', 'Payment', 'Returns', 'DeliveryCost'];

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            <div className="pt-24 pb-12 bg-pixio-beige relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pixio-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-black text-xs font-black uppercase tracking-widest shadow-sm border border-gray-100 mb-8">
                        <HelpCircle className="w-4 h-4 text-pixio-yellow" />
                        <span>{t('Subtitle')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-6">{t('Title')}<span className="text-pixio-yellow">.</span></h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="space-y-6">
                    {questions.map((key, index) => (
                        <div key={key} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                            <h3 className="text-xl font-black text-black mb-4 flex items-start gap-4">
                                <span className="bg-pixio-cream w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-1">
                                    {index + 1}
                                </span>
                                {t(`Questions.${key}.Question`)}
                            </h3>
                            <p className="text-gray-500 font-medium leading-relaxed pl-12">
                                {t(`Questions.${key}.Answer`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    )
}
