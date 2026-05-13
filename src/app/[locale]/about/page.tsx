import { getTranslations } from 'next-intl/server'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { BookOpen, Heart, Users, Target, Sparkles, Award, Truck } from 'lucide-react'
import Image from 'next/image'

export default async function AboutPage() {
    const t = await getTranslations('Common')

    return (
        <div className="min-h-screen bg-pixio-cream overflow-hidden">
            <Header />
            
            {/* Hero Section */}
            <section className="relative py-32 md:py-48 px-4 border-b border-gray-100">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-3 h-3 text-pixio-yellow" />
                        Notre Histoire
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black text-black tracking-tighter leading-none mb-10 italic">
                        Riwaya<span className="text-gray-200">.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-2xl font-bold text-gray-400 uppercase tracking-tight leading-relaxed">
                        Plus qu'une librairie, une destination pour les esprits curieux et les amoureux du savoir.
                    </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-pixio-yellow/20 blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-pixio-pink/20 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            </section>

            {/* Mission & Vision */}
            <section className="py-32 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-pixio-beige rounded-[3rem] -rotate-2"></div>
                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-black/5 z-10"></div>
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                     <BookOpen className="w-32 h-32 text-gray-200" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter">Notre Mission<span className="text-gray-200">.</span></h2>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-loose">
                                    Depuis notre création, nous nous efforçons de rendre la lecture accessible à tous au Maroc. Nous croyons fermement que chaque livre a le pouvoir de transformer une vie.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-black transition-all duration-500">
                                    <Heart className="w-8 h-8 text-black mb-6 group-hover:text-pixio-pink transition-colors" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-black group-hover:text-white mb-2">Passion</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight group-hover:text-gray-500">Sélectionnés avec soin par des passionnés.</p>
                                </div>
                                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-black transition-all duration-500">
                                    <Users className="w-8 h-8 text-black mb-6 group-hover:text-pixio-yellow transition-colors" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-black group-hover:text-white mb-2">Communauté</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight group-hover:text-gray-500">Unir les lecteurs marocains autour d'une plateforme unique.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Riwaya */}
            <section className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-black tracking-tighter mb-6 italic">Pourquoi Riwaya ?<span className="text-gray-200">.</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: Award, title: "Qualité Garantie", desc: "Livres originaux uniquement, vérifiés avant envoi." },
                            { icon: Truck, title: "Livraison Rapide", desc: "Expédition partout au Maroc en 24/48h." },
                            { icon: Target, title: "Service Client", desc: "Une équipe dédiée pour vous accompagner 7j/7." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 text-center group hover:-translate-y-2 transition-all duration-500">
                                <div className="w-20 h-20 bg-pixio-cream rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-black group-hover:rotate-6 transition-all duration-500">
                                    <item.icon className="w-10 h-10 text-black group-hover:text-white" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4">{item.title}</h3>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Location */}
            <section className="py-32 px-4 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-7xl font-black text-black tracking-tighter mb-4 italic">Notre Emplacement<span className="text-gray-200">.</span></h2>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Venez nous rendre visite à Rabat</p>
                    </div>
                    <div className="w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.1204143553496!2d-6.855548012368882!3d34.015119950525694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76d9be04b2cdb%3A0xb283e75db60f9d37!2sRiwaya!5e0!3m2!1sfr!2sma!4v1778441297097!5m2!1sfr!2sma"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0"
                            title="Riwaya - Rabat, Maroc"
                        ></iframe>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
