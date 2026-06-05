import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Palette, BookOpen, Star, Sparkles, BookHeart } from 'lucide-react'
import HeaderWithUser from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { isFeatureEnabled } from '@/lib/actions/site-settings'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import KidsProductsClient from './KidsProductsClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('KidsPage');
    return {
        title: `${t('Title')} | Riwaya`,
        description: t('Description'),
    }
}

export default async function KidsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // Guard: vérifier si la fonctionnalité Mon Enfant est activée
    const enabled = await isFeatureEnabled('feature_kids')
    if (!enabled) notFound()

    const t = await getTranslations('KidsPage');

    const kidsProducts = await prisma.extraProduct.findMany({
        where: { category: 'KIDS', active: true },
        orderBy: { createdAt: 'desc' }
    })

    const customStyles = `
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delay {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 7s ease-in-out infinite; }
    `

    return (
        <div className="min-h-screen bg-[#FDFBF7] overflow-hidden font-sans">
            <HeaderWithUser />
            <style>{customStyles}</style>
            {/* --- Hero Section --- */}

            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-50 mix-blend-multiply translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-50 mix-blend-multiply -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-100 text-yellow-700 font-bold mb-6 animate-bounce">
                            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                            <span>{t('HeroBadge')}</span>
                        </div>
                        <h1 
                            className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('HeroTitle') }}
                        />
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
                            {t('HeroDesc')}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <a href="#histoires" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-[2rem] font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-purple-500/25 flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                {t('HeroBtnStory')}
                            </a>
                            <a href="#coloriage" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-pink-100 rounded-[2rem] font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-pink-100 flex items-center gap-2">
                                <Palette className="w-6 h-6 text-pink-500" />
                                {t('HeroBtnColoring')}
                            </a>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="relative w-full aspect-square max-w-lg mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200 to-pink-200 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                            <Image 
                                src="/images/kids/hero.png" 
                                alt="Enfants lisant un livre magique" 
                                fill
                                className="object-contain relative z-10 drop-shadow-2xl animate-float"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Produits Enfants --- */}
            {kidsProducts.length > 0 && (
                <section className="py-24 bg-[#FDFBF7] relative z-10">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 font-bold mb-4 text-sm tracking-wide uppercase">
                                {t('SectionProducts.Badge')}
                            </div>
                            <h2 
                                className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                                dangerouslySetInnerHTML={{ __html: t.raw('SectionProducts.Title') }}
                            />
                            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                                {t('SectionProducts.Desc')}
                            </p>
                        </div>
                        <KidsProductsClient products={JSON.parse(JSON.stringify(kidsProducts))} />
                    </div>
                </section>
            )}

            {/* --- Features Grid --- */}
            <section className="py-20 bg-white relative z-10 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('SectionFeatures.BadgeTitle')}</h2>
                        <p className="text-lg text-gray-500 font-medium">{t('SectionFeatures.BadgeSubtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-yellow-50 p-8 rounded-[2rem] border-2 border-transparent hover:border-yellow-200 transition-colors text-center group">
                            <div className="w-20 h-20 bg-yellow-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <Sparkles className="w-10 h-10 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('SectionFeatures.StoryTitle')}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">{t('SectionFeatures.StoryDesc')}</p>
                        </div>
                        
                        {/* Feature 2 */}
                        <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-200 transition-colors text-center group">
                            <div className="w-20 h-20 bg-blue-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                <BookHeart className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('SectionFeatures.LearnTitle')}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">{t('SectionFeatures.LearnDesc')}</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-transparent hover:border-emerald-200 transition-colors text-center group">
                            <div className="w-20 h-20 bg-emerald-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <Palette className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('SectionFeatures.ColorTitle')}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">{t('SectionFeatures.ColorDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Histoires Section --- */}
            <section id="histoires" className="py-24 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 relative order-2 md:order-1">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <Image 
                                src="/images/kids/stories.png" 
                                alt="Petites histoires" 
                                fill
                                className="object-contain relative z-10 drop-shadow-xl animate-float-delay"
                            />
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold mb-4 text-sm tracking-wide uppercase">
                            {t('SectionStories.Badge')}
                        </div>
                        <h2 
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('SectionStories.Title') }}
                        />
                        <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
                            {t('SectionStories.Desc')}
                        </p>
                        <Link 
                            href="/books?category=Enfants"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg"
                        >
                            {t('SectionStories.Btn')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Coloriage Section --- */}
            <section id="coloriage" className="py-24 bg-white relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-green-50 skew-y-3 origin-bottom-right scale-110 -translate-y-12"></div>
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="flex-1">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold mb-4 text-sm tracking-wide uppercase">
                            {t('SectionColoring.Badge')}
                        </div>
                        <h2 
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('SectionColoring.Title') }}
                        />
                        <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
                            {t('SectionColoring.Desc')}
                        </p>
                        <Link 
                            href="/books?category=Coloriage"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg shadow-emerald-200"
                        >
                            {t('SectionColoring.Btn')}
                        </Link>
                    </div>
                    <div className="flex-1 relative">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <Image 
                                src="/images/kids/coloring.png" 
                                alt="Cahiers de coloriage" 
                                fill
                                className="object-contain relative z-10 drop-shadow-xl animate-float"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Apprentissage Doux Section --- */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 relative order-2 md:order-1">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-transparent rounded-full blur-2xl opacity-40"></div>
                            <Image 
                                src="/images/kids/numbers.png" 
                                alt="Apprentissage ludique des chiffres et lettres" 
                                fill
                                className="object-contain relative z-10 drop-shadow-xl animate-float-delay"
                            />
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold mb-4 text-sm tracking-wide uppercase">
                            {t('SectionLearning.Badge')}
                        </div>
                        <h2 
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('SectionLearning.Title') }}
                        />
                        <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
                            {t('SectionLearning.Desc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* --- La Sagesse Section --- */}
            <section className="py-24 bg-[#F8FAFC] relative">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 font-bold mb-4 text-sm tracking-wide uppercase">
                            {t('SectionWisdom.Badge')}
                        </div>
                        <h2 
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('SectionWisdom.Title') }}
                        />
                        <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
                            {t('SectionWisdom.Desc')}
                        </p>
                    </div>
                    <div className="flex-1 relative">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <div className="absolute inset-0 bg-amber-200 rounded-full blur-3xl opacity-30"></div>
                            <Image 
                                src="/images/kids/owl.png" 
                                alt="Chouette lisant un livre" 
                                fill
                                className="object-contain relative z-10 drop-shadow-2xl animate-float"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Bibliothèque Enchantée Section --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 relative order-2 md:order-1">
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <Image 
                                src="/images/kids/stack.png" 
                                alt="Pile de livres féerique" 
                                fill
                                className="object-contain relative z-10 drop-shadow-xl animate-float-delay"
                            />
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold mb-4 text-sm tracking-wide uppercase">
                            {t('SectionLibrary.Badge')}
                        </div>
                        <h2 
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t.raw('SectionLibrary.Title') }}
                        />
                        <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
                            {t('SectionLibrary.Desc')}
                        </p>
                        <Link 
                            href="/packs"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg shadow-purple-200"
                        >
                            {t('SectionLibrary.Btn')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Call to Action --- */}
            <section className="py-24 px-4 bg-gradient-to-br from-amber-400 to-orange-500 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6">{t('CTA.Title')}</h2>
                    <p className="text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto">{t('CTA.Desc')}</p>
                    <Link 
                        href="/books" 
                        className="inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 rounded-[2rem] font-bold text-xl hover:scale-105 transition-transform shadow-2xl"
                    >
                        {t('CTA.Btn')}
                    </Link>
                </div>
            </section>
            
            <Footer />
        </div>
    )
}
