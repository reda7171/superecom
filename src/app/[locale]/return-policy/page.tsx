
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { RefreshCcw, HelpCircle, AlertCircle, CheckCircle2, PhoneCall } from 'lucide-react'

export default async function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-black/5 border border-gray-100">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-10">
                        <RefreshCcw className="w-8 h-8" />
                    </div>
                    
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-12 italic">
                        Retours et Remboursements<span className="text-gray-200">.</span>
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-500 font-bold uppercase tracking-tight text-xs space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <HelpCircle className="w-5 h-5" /> 1. Droit de rétractation
                            </h2>
                            <p className="leading-relaxed">
                                Conformément à la législation en vigueur, vous disposez d'un délai de <strong>7 jours</strong> à compter de la réception de votre commande pour demander un échange ou un retour si le produit ne vous convient pas.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <AlertCircle className="w-5 h-5" /> 2. Conditions de retour
                            </h2>
                            <p className="leading-relaxed">
                                Pour être éligible à un retour, votre livre doit être dans le même état que celui dans lequel vous l'avez reçu (non lu, sans marques, pliures ou annotations). L'emballage original doit être conservé.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <CheckCircle2 className="w-5 h-5" /> 3. Articles défectueux
                            </h2>
                            <p className="leading-relaxed">
                                Si vous recevez un livre endommagé ou présentant un défaut de fabrication, nous nous engageons à le remplacer gratuitement dans les plus brefs délais.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <PhoneCall className="w-5 h-5" /> 4. Procédure de retour
                            </h2>
                            <p className="leading-relaxed">
                                Pour initier un retour, veuillez contacter notre service client via WhatsApp ou par email à admin@superEcom.store. Veuillez inclure votre numéro de commande et des photos si le produit est défectueux.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
