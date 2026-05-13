import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { BookOpen, Star, Sparkles, ArrowRight, Lightbulb, GraduationCap, Users } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

export default function BuyingGuidesPage() {
    const guides = [
        {
            title: "Comment choisir son livre de Business ?",
            desc: "Découvrez les 5 critères essentiels pour choisir une lecture qui boostera réellement votre carrière.",
            icon: Star,
            color: "bg-blue-500",
            image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Le guide des âges pour enfants",
            desc: "De 0 à 12 ans, trouvez le livre parfaitement adapté au développement de votre enfant.",
            icon: GraduationCap,
            color: "bg-pink-500",
            image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Échanger ou Acheter neuf ?",
            desc: "Tout comprendre sur le système d'échange Riwaya et comment optimiser votre budget lecture.",
            icon: Users,
            color: "bg-pixio-yellow",
            image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop"
        }
    ];

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            {/* Hero Section */}
            <div className="pt-32 pb-20 bg-pixio-beige relative overflow-hidden">
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/50 rounded-full blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-sm mb-8">
                        <Lightbulb className="w-4 h-4 text-pixio-yellow" />
                        <span>Conseils d'experts</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-6">
                        Guides <span className="text-blue-600 italic">d'Achat.</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                        Nous vous aidons à trouver la perle rare parmi des milliers de titres.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {guides.map((guide, idx) => (
                        <div key={idx} className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={guide.image} 
                                    alt={guide.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className={`absolute top-6 left-6 w-12 h-12 ${guide.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                    <guide.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-black leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                                    {guide.title}
                                </h3>
                                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                    {guide.desc}
                                </p>
                                <Link 
                                    href="/blog" 
                                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black group-hover:gap-5 transition-all"
                                >
                                    Lire le guide
                                    <ArrowRight className="w-4 h-4 text-blue-600" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Personalized Help */}
                <div className="mt-24 bg-white p-16 rounded-[4rem] border border-gray-100 flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8">
                            <Sparkles className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-4xl font-black text-black tracking-tight mb-6">Besoin d'un conseil personnalisé ?</h2>
                        <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10">
                            Envoyez-nous vos derniers coups de cœur sur WhatsApp, et nous vous concocterons une liste sur-mesure pour votre prochaine lecture.
                        </p>
                        <a href="/contact" className="inline-flex items-center justify-center px-12 py-6 bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-xl">
                            Parler à un expert
                        </a>
                    </div>
                    <div className="lg:w-1/2 relative">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pixio-yellow/20 rounded-full blur-3xl"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop" 
                            alt="Reading help" 
                            className="rounded-[3rem] shadow-xl relative z-10"
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
