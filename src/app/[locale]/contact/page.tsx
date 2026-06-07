import { getTranslations } from 'next-intl/server'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Globe } from 'lucide-react'
import { getAllSettings } from '@/lib/actions/site-settings'

export default async function ContactPage() {
    // Récupérer les paramètres du site
    const settings = await getAllSettings()
    const email = settings.contact_email || 'admin@superEcom.store'
    const phone = settings.contact_phone || '+212 600-000000'
    const address = settings.contact_address || 'Casablanca, Maroc'

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-24 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">

                    {/* Contact Info */}
                    <div className="space-y-16">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                                <Globe className="w-3 h-3" />
                                Support Client
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-none italic">
                                Contactez<br />Nous<span className="text-gray-200">.</span>
                            </h1>
                            <p className="text-lg font-bold text-gray-400 uppercase tracking-tight max-w-md">
                                Notre équipe est à votre écoute pour toute question concernant vos commandes ou nos ouvrages.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div className="space-y-4 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Email Direct</h3>
                                <p className="text-sm font-black text-black">{email}</p>
                            </div>
                            <div className="space-y-4 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Téléphone</h3>
                                <p className="text-sm font-black text-black">{phone}</p>
                            </div>
                            <div className="space-y-4 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Siège Social</h3>
                                <p className="text-sm font-black text-black">{address}</p>
                            </div>
                            <div className="space-y-4 group">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Horaires</h3>
                                <p className="text-sm font-black text-black">Lun - Sam : 09h - 19h</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-black/5 border border-gray-100 relative">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-pixio-yellow rounded-full flex items-center justify-center rotate-12 shadow-xl">
                            <MessageCircle className="w-10 h-10 text-black" />
                        </div>

                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nom Complet</label>
                                    <input type="text" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Votre nom" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email</label>
                                    <input type="email" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all" placeholder="votre@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Objet</label>
                                <input type="text" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Comment pouvons-nous vous aider ?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Message</label>
                                <textarea rows={5} className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2.5rem] text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all resize-none" placeholder="Votre message..."></textarea>
                            </div>
                            <button className="w-full py-6 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group">
                                Envoyer le Message
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    )
}
