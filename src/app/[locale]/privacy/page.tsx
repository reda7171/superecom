
import { getTranslations } from 'next-intl/server'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Shield, Lock, Eye, FileText, Database, Bell, UserCheck } from 'lucide-react'

export default async function PrivacyPage() {
    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-black/5 border border-gray-100">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-10">
                        <Shield className="w-8 h-8" />
                    </div>
                    
                    <h1 className="text-5xl font-black text-black tracking-tighter mb-12 italic">
                        Politique de Confidentialité<span className="text-gray-200">.</span>
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-500 font-bold uppercase tracking-tight text-xs space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Lock className="w-5 h-5" /> 1. Introduction
                            </h2>
                            <p className="leading-relaxed">
                                Chez <strong>SuperEcom</strong>, accessible via superEcom.store, l'une de nos priorités majeures est la confidentialité de nos visiteurs. Ce document contient les types d'informations collectées et enregistrées par SuperEcom et comment nous les utilisons.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Eye className="w-5 h-5" /> 2. Utilisation de Google AdSense
                            </h2>
                            <p className="leading-relaxed">
                                Google, en tant que fournisseur tiers, utilise des cookies pour diffuser des annonces sur notre site. L'utilisation du cookie DART par Google lui permet de diffuser des annonces aux visiteurs de notre site en fonction de leur visite sur superEcom.store et d'autres sites sur Internet. Les visiteurs peuvent choisir de ne pas utiliser le cookie DART en consultant la politique de confidentialité du réseau d'annonces Google et de contenu.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Database className="w-5 h-5" /> 3. Fichiers Journaux (Log Files)
                            </h2>
                            <p className="leading-relaxed">
                                SuperEcom suit une procédure standard d'utilisation des fichiers journaux. Ces fichiers enregistrent les visiteurs lorsqu'ils visitent des sites Web. Les informations collectées comprennent les adresses de protocole Internet (IP), le type de navigateur, le fournisseur de services Internet (FAI), l'horodatage, les pages de référence/sortie et éventuellement le nombre de clics.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <Bell className="w-5 h-5" /> 4. Cookies et Balises Web
                            </h2>
                            <p className="leading-relaxed">
                                Comme tout autre site Web, SuperEcom utilise des 'cookies'. Ces cookies sont utilisés pour stocker des informations, notamment les préférences des visiteurs et les pages du site Web auxquelles le visiteur a accédé. Ces informations sont utilisées pour optimiser l'expérience des utilisateurs en personnalisant le contenu de nos pages Web.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <UserCheck className="w-5 h-5" /> 5. RGPD et Droits des Utilisateurs
                            </h2>
                            <p className="leading-relaxed">
                                Nous tenons à nous assurer que vous connaissez tous vos droits en matière de protection des données. Chaque utilisateur a droit à l'accès, à la rectification, à l'effacement, à la limitation du traitement et au droit à la portabilité des données. Si vous souhaitez exercer l'un de ces droits, veuillez nous contacter.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-black text-xl font-black flex items-center gap-4">
                                <FileText className="w-5 h-5" /> 6. Informations pour les enfants
                            </h2>
                            <p className="leading-relaxed">
                                Une autre de nos priorités est la protection des enfants lors de l'utilisation d'Internet. Nous encourageons les parents et les tuteurs à observer, participer et/ou surveiller et guider leur activité en ligne. SuperEcom ne collecte sciemment aucune information personnelle identifiable auprès d'enfants de moins de 13 ans.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
