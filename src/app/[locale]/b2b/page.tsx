import { Metadata } from 'next'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Partenariats B2B | SuperEcom',
    description: 'Collaborez avec SuperEcom pour promouvoir vos produits et services auprès de milliers de lecteurs au Maroc.',
    keywords: ['partenariat', 'b2b', 'publicité', 'collaboration', 'marketing', 'livres', 'maroc'],
}

export default function B2BPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
                            Partenariats<span className="text-pixio-yellow">.</span>
                        </h1>
                        <p className="text-2xl text-gray-300 leading-relaxed">
                            Collaborez avec SuperEcom et touchez des milliers de lecteurs passionnés au Maroc
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-pixio-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-5xl font-black text-black mb-2">10K+</div>
                            <div className="text-gray-600 font-bold">Visiteurs mensuels</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-black mb-2">500+</div>
                            <div className="text-gray-600 font-bold">Commandes par mois</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-black mb-2">50+</div>
                            <div className="text-gray-600 font-bold">Villes couvertes</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Opportunités */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-black text-black mb-16 text-center">
                        Opportunités de collaboration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Publicité */}
                        <div className="bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-pixio-yellow transition-colors">
                            <div className="w-16 h-16 bg-pixio-yellow rounded-2xl flex items-center justify-center mb-6">
                                <span className="text-3xl">📢</span>
                            </div>
                            <h3 className="text-2xl font-black text-black mb-4">Espaces publicitaires</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Affichez vos bannières sur notre site web et touchez une audience qualifiée de lecteurs passionnés.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-pixio-yellow font-bold">✓</span>
                                    <span>Bannières homepage, sidebar, footer</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-pixio-yellow font-bold">✓</span>
                                    <span>Ciblage par catégorie de livres</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-pixio-yellow font-bold">✓</span>
                                    <span>Statistiques détaillées (vues, clics, CTR)</span>
                                </li>
                            </ul>
                        </div>

                        {/* Partenariat produits */}
                        <div className="bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-pixio-yellow transition-colors">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                                <span className="text-3xl">🤝</span>
                            </div>
                            <h3 className="text-2xl font-black text-black mb-4">Partenariat produits</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Proposez vos produits complémentaires (papeterie, accessoires de lecture, etc.) à notre communauté.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>Intégration dans notre catalogue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>Cross-promotion avec nos livres</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>Gestion logistique simplifiée</span>
                                </li>
                            </ul>
                        </div>

                        {/* Événements */}
                        <div className="bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-pixio-yellow transition-colors">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <h3 className="text-2xl font-black text-black mb-4">Événements & Sponsoring</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Sponsorisez nos événements littéraires et clubs de lecture pour augmenter votre visibilité.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-600 font-bold">✓</span>
                                    <span>Clubs de lecture mensuels</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-600 font-bold">✓</span>
                                    <span>Rencontres avec auteurs</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-600 font-bold">✓</span>
                                    <span>Campagnes marketing co-brandées</span>
                                </li>
                            </ul>
                        </div>

                        {/* Affiliation */}
                        <div className="bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-pixio-yellow transition-colors">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <span className="text-3xl">💰</span>
                            </div>
                            <h3 className="text-2xl font-black text-black mb-4">Programme d'affiliation</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Recommandez SuperEcom à votre audience et gagnez des commissions sur chaque vente.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">✓</span>
                                    <span>Commission attractive sur les ventes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">✓</span>
                                    <span>Liens et codes promo personnalisés</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">✓</span>
                                    <span>Dashboard de suivi en temps réel</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-32 bg-black text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black mb-6">
                            Démarrons une collaboration<span className="text-pixio-yellow">.</span>
                        </h2>
                        <p className="text-xl text-gray-300">
                            Remplissez le formulaire ci-dessous et notre équipe vous contactera sous 48h
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Nom complet *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pixio-yellow text-white placeholder-gray-400"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Entreprise *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pixio-yellow text-white placeholder-gray-400"
                                    placeholder="Votre entreprise"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pixio-yellow text-white placeholder-gray-400"
                                    placeholder="contact@entreprise.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Téléphone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pixio-yellow text-white placeholder-gray-400"
                                    placeholder="+212 6XX XXX XXX"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Type de collaboration *</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pixio-yellow text-white"
                            >
                                <option value="">Sélectionnez...</option>
                                <option value="advertising">Espaces publicitaires</option>
                                <option value="partnership">Partenariat produits</option>
                                <option value="events">Événements & Sponsoring</option>
                                <option value="affiliation">Programme d'affiliation</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Message *</label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-pixio-yellow text-white placeholder-gray-400 resize-none"
                                placeholder="Décrivez votre projet de collaboration..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-8 py-4 bg-pixio-yellow text-black rounded-full hover:bg-yellow-400 transition-colors font-black text-lg flex items-center justify-center gap-3"
                        >
                            <Send className="w-5 h-5" />
                            Envoyer la demande
                        </button>
                    </form>

                    {/* Contact direct */}
                    <div className="mt-16 pt-16 border-t border-white/10">
                        <h3 className="text-2xl font-black mb-8 text-center">Ou contactez-nous directement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <Mail className="w-8 h-8 mx-auto mb-3 text-pixio-yellow" />
                                <div className="font-bold">Email</div>
                                <a href="mailto:b2b@superEcom.com" className="text-gray-300 hover:text-pixio-yellow transition-colors">
                                    b2b@superEcom.com
                                </a>
                            </div>
                            <div>
                                <Phone className="w-8 h-8 mx-auto mb-3 text-pixio-yellow" />
                                <div className="font-bold">Téléphone</div>
                                <a href="tel:+212600000000" className="text-gray-300 hover:text-pixio-yellow transition-colors">
                                    +212 6XX XXX XXX
                                </a>
                            </div>
                            <div>
                                <MapPin className="w-8 h-8 mx-auto mb-3 text-pixio-yellow" />
                                <div className="font-bold">Adresse</div>
                                <div className="text-gray-300">
                                    Casablanca, Maroc
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
