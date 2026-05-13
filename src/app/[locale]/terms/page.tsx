
import { getTranslations } from 'next-intl/server'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Scale, Info, CheckCircle, AlertTriangle, Truck, CreditCard } from 'lucide-react'

export default async function TermsPage() {
    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-black/5 border border-gray-100">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-10">
                        <Scale className="w-8 h-8" />
                    </div>
                    
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-12 italic">
                        Conditions Générales d'Utilisation<span className="text-gray-200">.</span>
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-500 font-bold uppercase tracking-tight text-xs space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Info className="w-5 h-5" /> 1. Objet
                            </h2>
                            <p className="leading-relaxed">
                                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet l'encadrement juridique des modalités de mise à disposition du site et des services par <strong>Riwaya</strong> et de définir les conditions d'accès et d'utilisation des services par l'Utilisateur.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <AlertTriangle className="w-5 h-5" /> 2. Propriété Intellectuelle
                            </h2>
                            <p className="leading-relaxed">
                                Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son…) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <CreditCard className="w-5 h-5" /> 3. Commandes et Prix
                            </h2>
                            <p className="leading-relaxed">
                                Les prix des produits sont indiqués en Dirhams toutes taxes comprises. <strong>Riwaya</strong> se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable à l'acheteur.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Truck className="w-5 h-5" /> 4. Livraison (COD)
                            </h2>
                            <p className="leading-relaxed">
                                Le mode de paiement principal est le paiement à la livraison (Cash on Delivery). L'utilisateur s'engage à être présent ou représenté pour réceptionner la commande à l'adresse indiquée lors de la validation.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <CheckCircle className="w-5 h-5" /> 5. Responsabilité
                            </h2>
                            <p className="leading-relaxed">
                                Les sources des informations diffusées sur le site riwaya.store sont réputées fiables mais le site ne garantit pas qu'il soit exempt de défauts, d'erreurs ou d'omissions.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
