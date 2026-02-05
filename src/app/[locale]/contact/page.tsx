import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function ContactPage() {
    const t = await getTranslations('Contact');

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            <div className="pt-24 pb-12 bg-black relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pixio-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20 mb-8">
                        <Mail className="w-4 h-4 text-pixio-yellow" />
                        <span>{t('Subtitle')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">{t('Title')}<span className="text-pixio-yellow">.</span></h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Contact Info */}
                    <div className="bg-black text-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl flex flex-col justify-between space-y-12">
                        <div>
                            <h3 className="text-3xl font-black text-white mb-2">Get in touch</h3>
                            <p className="text-gray-400 font-medium">We'd love to hear from you.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('Info.Email')}</p>
                                    <p className="text-lg font-bold">admin@riwaya.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('Info.Phone')}</p>
                                    <p className="text-lg font-bold">+212 6 XX XX XX XX</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('Info.Address')}</p>
                                    <p className="text-lg font-bold">Casablanca, Morocco</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{t('Info.Hours')}</p>
                            <p className="font-bold text-gray-300">Mon - Fri: 9:00 - 18:00</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-gray-100">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">{t('Form.Name')}</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black placeholder-gray-300"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">{t('Form.Email')}</label>
                                <input
                                    type="email"
                                    className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black placeholder-gray-300"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-2">{t('Form.Message')}</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black placeholder-gray-300 resize-none"
                                    placeholder="..."
                                ></textarea>
                            </div>
                            <button className="w-full flex items-center justify-center gap-3 bg-black text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-full hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20 group">
                                <span>{t('Form.Submit')}</span>
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
