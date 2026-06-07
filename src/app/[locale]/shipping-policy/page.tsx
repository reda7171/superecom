
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Truck, Clock, MapPin, ShieldCheck, Globe } from 'lucide-react'

export default async function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-black/5 border border-gray-100">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-10">
                        <Truck className="w-8 h-8" />
                    </div>
                    
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-12 italic">
                        Politique de Livraison<span className="text-gray-200">.</span>
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-500 font-bold uppercase tracking-tight text-xs space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <MapPin className="w-5 h-5" /> 1. Zones de livraison
                            </h2>
                            <p className="leading-relaxed">
                                <strong>SuperEcom</strong> livre dans toutes les villes du Royaume du Maroc. Que vous soyez à Casablanca, Rabat, Marrakech, Tanger ou dans les zones plus reculées, nous nous assurons que vos livres arrivent à bon port.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Clock className="w-5 h-5" /> 2. Délais de livraison
                            </h2>
                            <p className="leading-relaxed">
                                Nos délais de livraison varient généralement entre <strong>24h et 48h</strong> ouvrables pour les grandes villes. Pour les autres régions, le délai peut s'étendre jusqu'à 4 jours ouvrables.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <ShieldCheck className="w-5 h-5" /> 3. Frais de livraison
                            </h2>
                            <p className="leading-relaxed">
                                Les frais de livraison sont calculés lors de la validation de votre commande. Nous offrons régulièrement la livraison gratuite pour les commandes dépassant un certain montant (voir offres en cours sur la page d'accueil).
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Globe className="w-5 h-5" /> 4. Suivi de commande
                            </h2>
                            <p className="leading-relaxed">
                                Une fois votre commande expédiée, vous recevrez une confirmation par SMS ou WhatsApp avec les informations nécessaires pour suivre l'état de votre livraison.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
