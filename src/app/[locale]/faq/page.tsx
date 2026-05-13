import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { HelpCircle, Truck, CreditCard, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function FAQPage() {
    const t = await getTranslations('FAQ');

    const faqSections = [
        {
            title: "Livraison & Expédition",
            icon: Truck,
            questions: [
                {
                    q: "Quels sont les délais de livraison ?",
                    a: "Pour Casablanca et environs, la livraison s'effectue en 24h à 48h. Pour les autres villes du Maroc, comptez entre 2 et 4 jours ouvrables."
                },
                {
                    q: "Puis-je suivre mon colis ?",
                    a: "Oui, dès l'expédition de votre commande, vous recevrez un numéro de suivi par SMS ou Email. Vous pouvez également consulter la page 'Suivre ma commande' sur notre site."
                },
                {
                    q: "Quels sont les frais de livraison ?",
                    a: "La livraison est de 25 MAD pour Casablanca et 35 MAD pour les autres villes. Elle est offerte pour toute commande supérieure à 300 MAD."
                }
            ]
        },
        {
            title: "Paiement & Sécurité",
            icon: CreditCard,
            questions: [
                {
                    q: "Quels modes de paiement acceptez-vous ?",
                    a: "Nous privilégions le paiement à la livraison (Cash on Delivery) pour votre sécurité. Vous payez directement le livreur au moment de la réception de votre colis."
                },
                {
                    q: "Le paiement est-il sécurisé ?",
                    a: "Oui, en payant à la livraison, vous ne prenez aucun risque. Vous vérifiez votre colis avant de régler le montant dû."
                }
            ]
        },
        {
            title: "Retours & Échanges",
            icon: RotateCcw,
            questions: [
                {
                    q: "Puis-je retourner un livre ?",
                    a: "Absolument. Vous disposez de 7 jours après réception pour demander un retour si le livre ne correspond pas à vos attentes ou s'il présente un défaut."
                },
                {
                    q: "Comment s'effectue le remboursement ?",
                    a: "Après vérification de l'état du livre retourné, nous procédons au remboursement via virement bancaire ou par un bon d'achat utilisable immédiatement sur le site."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <div className="pt-32 pb-20 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pixio-yellow/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-gray-100 mb-8">
                        <HelpCircle className="w-4 h-4 text-pixio-yellow" />
                        <span>Centre d'aide</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-6">
                        Questions <span className="text-pixio-yellow italic">Fréquentes.</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                        Tout ce que vous devez savoir pour commander en toute sérénité sur Riwaya.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="space-y-16">
                    {faqSections.map((section, idx) => (
                        <section key={idx}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-black uppercase tracking-tight">{section.title}</h2>
                            </div>
                            
                            <div className="space-y-4">
                                {section.questions.map((faq, fIdx) => (
                                    <div key={fIdx} className="group bg-gray-50 rounded-[2rem] p-8 border border-transparent hover:border-gray-200 hover:bg-white transition-all cursor-pointer">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-lg font-black text-black leading-tight">{faq.q}</h3>
                                            <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                                        </div>
                                        <p className="mt-4 text-gray-500 font-medium leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Still have questions? */}
                <div className="mt-24 bg-black text-white p-12 rounded-[3rem] text-center relative overflow-hidden">
                    <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 -rotate-12" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4 tracking-tight uppercase">Encore une question ?</h2>
                        <p className="text-gray-400 font-medium mb-8 max-w-lg mx-auto">
                            Notre support WhatsApp est disponible 7j/7 pour vous aider dans vos choix ou le suivi de vos commandes.
                        </p>
                        <a href="/contact" className="inline-flex items-center justify-center px-10 py-5 bg-pixio-yellow text-black font-black text-xs uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-xl">
                            Contacter le Support
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
