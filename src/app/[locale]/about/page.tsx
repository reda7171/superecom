import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { BookOpen, Target, Heart, Award, ShieldCheck, Truck, Clock, Headphones, Quote, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'AboutPage' })

    return {
        title: `${t('Hero.Title')} | Riwaya`,
        description: t('Hero.Subtitle')
    }
}

export default async function AboutPage() {
    const t = await getTranslations('AboutPage')

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            {/* Hero Section */}
            <section className="relative py-32 bg-pixio-beige overflow-hidden text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-6xl md:text-8xl font-black text-black mb-8 tracking-tighter">{t('Hero.Title')}<span className="text-gray-300">.</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 max-w-xl mx-auto leading-loose">
                        {t('Hero.Subtitle')}
                    </p>
                </div>
            </section>

            {/* Inspirational Quote Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <Quote className="w-16 h-16 text-pixio-cream mx-auto mb-10 opacity-50" />
                    <p className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tighter mb-10 italic">
                        "{t('Quote.Text')}"
                    </p>
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-pixio-cream rounded-full">
                        <Sparkles className="w-4 h-4 text-black" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
                            {t('Quote.Source')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-sm">
                                <Target className="w-4 h-4" />
                                <span>{t('Mission.Badge')}</span>
                            </div>
                            <h2 className="text-5xl font-black text-black leading-none tracking-tighter">{t('Mission.Title1')}<br />{t('Mission.Title2')}</h2>
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-loose">
                                {t('Mission.Desc1')}
                            </p>
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-loose">
                                {t('Mission.Desc2')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-beige rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <Heart className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">{t('Values.Passion.Title')}</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{t('Values.Passion.Desc')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-pink rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <Award className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">{t('Values.Quality.Title')}</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{t('Values.Quality.Desc')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-yellow rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <ShieldCheck className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">{t('Values.Trust.Title')}</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{t('Values.Trust.Desc')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-beige rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <Truck className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">{t('Values.Proximity.Title')}</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{t('Values.Proximity.Desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-32 bg-pixio-cream overflow-visible relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-black tracking-tighter mb-4">{t('Team.Title')}<span className="text-gray-300">.</span></h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t('Team.Subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Team Member 1 */}
                        <div className="group bg-white rounded-[3rem] p-10 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-xl">
                            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                                <div className="w-32 h-32 relative shrink-0">
                                    <div className="absolute inset-0 bg-black rounded-full rotate-6 group-hover:rotate-0 transition-transform duration-500"></div>
                                    <img
                                        src="https://images.pexels.com/photos/17050931/pexels-photo-17050931.jpeg?w=200&h=200&fit=crop"
                                        alt={t('Team.Member1.Name')}
                                        className="w-full h-full object-cover rounded-full relative z-10 border-4 border-white"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-black mb-2 tracking-tight">{t('Team.Member1.Name')}</h4>
                                    <p className="text-[9px] font-black text-pixio-pink uppercase tracking-widest mb-4">{t('Team.Member1.Role')}</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        {t('Team.Member1.Bio')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Team Member 2 */}
                        <div className="group bg-white rounded-[3rem] p-10 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-xl">
                            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                                <div className="w-32 h-32 relative shrink-0">
                                    <div className="absolute inset-0 bg-pixio-yellow rounded-full -rotate-3 group-hover:rotate-0 transition-transform duration-500"></div>
                                    <img
                                        src="https://images.unsplash.com/photo-1742119971773-57e0131095b0?ixid=M3w4NjU0NDF8MHwxfHNlYXJjaHwxfHxQb3J0cmFpdCUyMG9mJTIwWW91c3NlZiUyMEVsJTIwSWRyaXNzaSUyMHRlY2glMjBsZWFkJTIwcHJvZmVzc2lvbmFsJTIwbWFuJTIwaW4lMjBvZmZpY2V8ZW58MHwyfHx8MTc3MDgxOTEwM3ww&ixlib=rb-4.1.0&w=200&h=200&fit=crop&fm=jpg&q=80"
                                        alt={t('Team.Member2.Name')}
                                        className="w-full h-full object-cover rounded-full relative z-10 border-4 border-white"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-black mb-2 tracking-tight">{t('Team.Member2.Name')}</h4>
                                    <p className="text-[9px] font-black text-pixio-yellow uppercase tracking-widest mb-4">{t('Team.Member2.Role')}</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        {t('Team.Member2.Bio')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Team Member 3 */}
                        <div className="group bg-white rounded-[3rem] p-10 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-xl">
                            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                                <div className="w-32 h-32 relative shrink-0">
                                    <div className="absolute inset-0 bg-pixio-beige rounded-full rotate-3 group-hover:rotate-0 transition-transform duration-500"></div>
                                    <img
                                        src="https://images.unsplash.com/photo-1581488613476-ea9bcf51ccf7?ixid=M3w4NjU0NDF8MHwxfHNlYXJjaHwxfHxQb3J0cmFpdCUyMG9mJTIwU2FyYSUyMEJlbmFsaSUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDB8Mnx8fDE3NzA4MTkxMDN8MA&ixlib=rb-4.1.0&w=200&h=200&fit=crop&fm=jpg&q=80"
                                        alt={t('Team.Member3.Name')}
                                        className="w-full h-full object-cover rounded-full relative z-10 border-4 border-white"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-black mb-2 tracking-tight">{t('Team.Member3.Name')}</h4>
                                    <p className="text-[9px] font-black text-pixio-beige-dark uppercase tracking-widest mb-4">{t('Team.Member3.Role')}</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        {t('Team.Member3.Bio')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Team Member 4 */}
                        <div className="group bg-white rounded-[3rem] p-10 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-xl">
                            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                                <div className="w-32 h-32 relative shrink-0">
                                    <div className="absolute inset-0 bg-gray-200 rounded-full -rotate-6 group-hover:rotate-0 transition-transform duration-500"></div>
                                    <img
                                        src="https://images.pexels.com/photos/27603433/pexels-photo-27603433.jpeg?w=200&h=200&fit=crop"
                                        alt={t('Team.Member4.Name')}
                                        className="w-full h-full object-cover rounded-full relative z-10 border-4 border-white"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-black mb-2 tracking-tight">{t('Team.Member4.Name')}</h4>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('Team.Member4.Role')}</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        {t('Team.Member4.Bio')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-black tracking-tighter mb-4">{t('WhyUs.Title')}</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t('WhyUs.Subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="p-12 rounded-[3rem] bg-pixio-cream border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-500 group">
                            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 transform -rotate-6 group-hover:rotate-0 transition-transform">
                                <Clock className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">{t('WhyUs.LiveStock.Title')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">{t('WhyUs.LiveStock.Desc')}</p>
                        </div>
                        <div className="p-12 rounded-[3rem] bg-pixio-cream border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-500 group">
                            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 transform rotate-3 group-hover:rotate-0 transition-transform">
                                <Headphones className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">{t('WhyUs.ExpertHelp.Title')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">{t('WhyUs.ExpertHelp.Desc')}</p>
                        </div>
                        <div className="p-12 rounded-[3rem] bg-pixio-cream border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-500 group">
                            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 transform -rotate-1 group-hover:rotate-0 transition-transform">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">{t('WhyUs.SafeArrival.Title')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">{t('WhyUs.SafeArrival.Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 bg-black text-white text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-none">{t('CTA.Title')}<span className="text-pixio-pink">.</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-16 max-w-xl mx-auto leading-loose">
                        {t('CTA.Subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a href="/books" className="px-14 py-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-pixio-cream transition-all shadow-2xl">
                            {t('CTA.SelectLibrary')}
                        </a>
                        <a href="/packs" className="px-14 py-8 bg-black border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:border-white transition-all">
                            {t('CTA.ViewBundles')}
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
