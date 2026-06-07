import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Star, Usb, Clock, Users, Play, Tv2, WifiOff, ShieldOff, Globe, HardDrive, Baby } from 'lucide-react'
import UsbInteractive, { HeroPreviewButton, VideoPlayButton } from '@/components/UsbInteractive'
import HeaderWithUser from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { getActiveMenuBySlug } from '@/lib/actions/menus'
import { isFeatureEnabled } from '@/lib/actions/site-settings'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('UsbPage');
    return {
        title: `${t('Title')} | SuperEcom`,
        description: t('Description'),
    }
}


/* ================================================================
   DONNÉES
================================================================ */
const videoSeries = [
    {
        id: 1,
        title: "Alef Ba Ta – L'alphabet arabe animé",
        category: 'Langues', lang: 'AR', age: '3-7 ans',
        episodes: 28, totalHours: '5h', image: '/usb_arabic_letters.png',
        color: '#4ECDC4', badge: 'Populaire',
        desc: "Chaque lettre arabe prend vie dans une aventure unique.",
        previewVideo: 'https://www.youtube.com/embed/PLDlmA3hhlQ?autoplay=1&rel=0',
        thumbnail: '/usb_arabic_letters.png', duration: '5h', videoUrl: '', description: "Chaque lettre arabe prend vie.",
        bg: '#F0FAFA',
    },
    {
        id: 2,
        title: 'Compte avec moi – Les chiffres 1 à 100',
        category: 'Sciences', lang: 'FR', age: '4-8 ans',
        episodes: 40, totalHours: '7h', image: '/usb_numbers.png',
        color: '#F7B731', badge: 'Bestseller',
        desc: "Addition, soustraction et comptage à travers des jeux animés.",
        previewVideo: 'https://www.youtube.com/embed/VFmNKM_FRIY?autoplay=1&rel=0',
        thumbnail: '/usb_numbers.png', duration: '7h', videoUrl: '', description: "Les chiffres en jeux animés.",
        bg: '#FFFBF0',
    },
    {
        id: 3,
        title: 'Mon Petit Coran – Les Sourates',
        category: 'Religion', lang: 'AR', age: '4-12 ans',
        episodes: 30, totalHours: '8h', image: '/usb_quran.png',
        color: '#6C5CE7', badge: 'Exclusif',
        desc: "Les 30 dernières sourates avec tajwid simplifié.",
        previewVideo: 'https://www.youtube.com/embed/LkrPfIEMRtg?autoplay=1&rel=0',
        thumbnail: '/usb_quran.png', duration: '8h', videoUrl: '', description: "Sourates avec tajwid.",
        bg: '#F5F3FF',
    },
    {
        id: 4,
        title: 'La Nature et les Animaux du Monde',
        category: 'Sciences', lang: 'FR/AR', age: '5-10 ans',
        episodes: 52, totalHours: '10h', image: '/usb_nature.png',
        color: '#00B894', badge: 'Nouveau',
        desc: "Un tour du monde des animaux sauvages.",
        previewVideo: 'https://www.youtube.com/embed/9kCXBnos4ys?autoplay=1&rel=0',
        thumbnail: '/usb_nature.png', duration: '10h', videoUrl: '', description: "Documentaire animaux.",
        bg: '#F0FFF8',
    },
    {
        id: 5,
        title: 'Je cuisine avec maman',
        category: 'Créativité', lang: 'FR', age: '5-12 ans',
        episodes: 24, totalHours: '8h', image: '/usb_cooking.png',
        color: '#FD79A8', badge: '',
        desc: "Recettes simples et amusantes.",
        previewVideo: 'https://www.youtube.com/embed/AyE3rTz4eME?autoplay=1&rel=0',
        thumbnail: '/usb_cooking.png', duration: '8h', videoUrl: '', description: "Recettes pour enfants.",
        bg: '#FFF5FA',
    },
    {
        id: 6,
        title: 'Les Mille et Une Histoires',
        category: 'Histoires', lang: 'FR/AR', age: '3-10 ans',
        episodes: 100, totalHours: '14h', image: '/usb_stories.png',
        color: '#A29BFE', badge: 'Collection complète',
        desc: "100 contes du patrimoine arabe et universel.",
        previewVideo: 'https://www.youtube.com/embed/GJMXMXz19mA?autoplay=1&rel=0',
        thumbnail: '/usb_stories.png', duration: '14h', videoUrl: '', description: "100 contes animés.",
        bg: '#F8F7FF',
    },
    {
        id: 7,
        title: 'Nasheeds & Chansons Éducatives',
        category: 'Musique', lang: 'AR/FR', age: '2-8 ans',
        episodes: 80, totalHours: '4h', image: '/usb_stories.png',
        color: '#E17055', badge: '',
        desc: "80 nasheeds et chansons pour apprendre.",
        previewVideo: 'https://www.youtube.com/embed/k5ZBxmZ3Ry4?autoplay=1&rel=0',
        thumbnail: '/usb_stories.png', duration: '4h', videoUrl: '', description: "Nasheeds éducatifs.",
        bg: '#FFF5F3',
    },
    {
        id: 8,
        title: 'Les Bonnes Valeurs Islamiques',
        category: 'Religion', lang: 'AR/FR', age: '4-12 ans',
        episodes: 50, totalHours: '10h', image: '/usb_quran.png',
        color: '#00CEC9', badge: '',
        desc: "Honnêteté, partage, respect des parents.",
        previewVideo: 'https://www.youtube.com/embed/Qv6R1L4L9oc?autoplay=1&rel=0',
        thumbnail: '/usb_quran.png', duration: '10h', videoUrl: '', description: "Valeurs islamiques animées.",
        bg: '#F0FFFE',
    },
    {
        id: 9,
        title: "A, B, C – Le Français pour les Petits",
        category: 'Langues', lang: 'FR', age: '3-7 ans',
        episodes: 26, totalHours: '4h', image: '/usb_arabic_letters.png',
        color: '#0984E3', badge: '',
        desc: "Les 26 lettres en chansons et histoires.",
        previewVideo: 'https://www.youtube.com/embed/hq3yfQnllfQ?autoplay=1&rel=0',
        thumbnail: '/usb_arabic_letters.png', duration: '4h', videoUrl: '', description: "Alphabet français animé.",
        bg: '#F0F8FF',
    },
]

const getFeatures = (t: any) => [
    { Icon: Tv2,       color: '#FF6B6B', bg: '#FFF0F0', label: t('Features.F1') },
    { Icon: WifiOff,   color: '#4ECDC4', bg: '#F0FAFA', label: t('Features.F2') },
    { Icon: ShieldOff, color: '#F7B731', bg: '#FFFBF0', label: t('Features.F3') },
    { Icon: Globe,     color: '#A29BFE', bg: '#F8F7FF', label: t('Features.F4') },
    { Icon: HardDrive, color: '#00B894', bg: '#F0FFF8', label: t('Features.F5') },
    { Icon: Baby,      color: '#FD79A8', bg: '#FFF5FA', label: t('Features.F6') },
]

const totalEpisodes = videoSeries.reduce((sum, s) => sum + s.episodes, 0)

export default async function UsbEducPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // Guard: vérifier si la fonctionnalité Clé USB est activée
    const enabled = await isFeatureEnabled('feature_usb')
    if (!enabled) notFound()

    const [t, menu] = await Promise.all([
        getTranslations('UsbPage'),
        getActiveMenuBySlug('usb-fameux')
    ]);
    const translatedFeatures = getFeatures(t);

    return (
        <div className="min-h-screen bg-[#FDFBF7] overflow-x-hidden">
            <HeaderWithUser />

            {/* ===================== HERO ===================== */}
            <section className="relative pt-16 pb-24 overflow-hidden">
                <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-orange-100 opacity-60 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal-100 opacity-50 blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 text-center md:text-left slide-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-6 wiggle">
                            <Usb className="w-4 h-4" />
                            <span>{t('HeroBadge', { seriesCount: videoSeries.length, episodesCount: totalEpisodes })}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-4">
                            {t('HeroTitleP1')}
                            <span className="relative inline-block">
                                <span style={{ color: '#FF6B6B' }}>{t('HeroTitleP2')}</span>
                                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: '#FF6B6B', opacity: 0.4 }} />
                            </span>
                        </h1>
                        <p 
                            className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: t.raw('HeroDesc') }}
                        />
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
                            <Link href="/cle-usb/commander"
                                className="px-8 py-4 rounded-2xl text-white font-bold text-lg hover:scale-105 transition-all pulse-cta"
                                style={{ backgroundColor: '#FF6B6B' }}
                            >
                                {t('BtnOrder')}
                            </Link>
                            <HeroPreviewButton serie={videoSeries[0]} />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                            <span className="text-4xl font-black text-gray-900">{t('PriceNew')}</span>
                            <span className="text-lg text-gray-400 line-through">{t('PriceOld')}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{t('Discount')}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{t('HeroFooterText')}</p>
                    </div>

                    <div className="flex-1 flex justify-center slide-right">
                        <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-orange-200 spin-slow" />
                            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-100 to-teal-100 blur-xl opacity-80" />
                            <Image src="/usb_device_mockup.png" alt="Clé USB éducative SuperEcom" fill className="object-contain relative z-10 drop-shadow-2xl float-2" priority />
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg float-1 z-20">{t('Badge500h')}</div>
                            <div className="absolute -bottom-2 -left-2 bg-teal-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg float-3 z-20">{t('Badge3Lang')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===================== FEATURES STRIP ===================== */}
            <section className="bg-white border-y border-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {translatedFeatures.map((f) => (
                            <div key={f.label} className="flex flex-col items-center gap-2 text-center p-4 rounded-2xl hover:scale-105 transition-transform">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: f.bg }}>
                                    <f.Icon className="w-6 h-6" style={{ color: f.color }} strokeWidth={1.8} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===================== FAMILY PROMO IMAGE ===================== */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src="/usb_promo_banner.png"
                            alt="Famille regardant des vidéos éducatives sur la clé USB SuperEcom"
                            width={1400} height={600}
                            className="w-full object-cover"
                            style={{ maxHeight: '500px' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                            <div className="text-white px-12 max-w-lg">
                                <p className="text-orange-300 font-bold text-sm mb-2 uppercase tracking-widest">{t('PromoTitleSub')}</p>
                                <h2 className="text-4xl font-black mb-4 leading-tight">{t('PromoTitle')}</h2>
                                <p className="text-white/80 leading-relaxed">{t('PromoDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===================== CATALOGUE VIDÉOS ===================== */}
            <section id="videos" className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-gray-900 mb-3">
                            {t('CatalogTitle', { seriesCount: videoSeries.length })}
                        </h2>
                        <p className="text-gray-500 text-lg">{t('CatalogDesc')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videoSeries.map((serie) => (
                            <div key={serie.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <Image src={serie.image} alt={serie.title} fill className="object-cover transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-4">
                                        <span className="text-white text-sm font-bold">{serie.totalHours}</span>
                                    </div>
                                    {serie.badge && (
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: serie.color }}>
                                            {serie.badge}
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-full text-white text-xs font-bold backdrop-blur-sm">
                                        {serie.lang}
                                    </div>
                                    {/* Bouton play : client component */}
                                    <VideoPlayButton serie={serie} />
                                </div>
                                <div className="p-5">
                                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: serie.color + '22', color: serie.color }}>
                                        {serie.category}
                                    </span>
                                    <h3 className="text-base font-bold text-gray-900 mt-2 mb-1 leading-tight line-clamp-2">{serie.title}</h3>
                                    <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{serie.desc}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
                                        <span className="flex items-center gap-1"><Play className="w-3 h-3" />{serie.episodes} {t('Episodes')}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{serie.totalHours}</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{serie.age}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-gray-400 text-sm mt-8">
                        {t('CatalogFooter')}
                    </p>
                </div>
            </section>

            {/* ===================== HOW IT WORKS ===================== */}
            <section id="how-it-works" className="py-16 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl font-black text-gray-900 text-center mb-10">{t('HowTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { step: '01', icon: <Usb className="w-8 h-8" />, title: t('HowSteps.Step1Title'), desc: t('HowSteps.Step1Desc'), color: '#FF6B6B' },
                            { step: '02', icon: <Play className="w-8 h-8" />, title: t('HowSteps.Step2Title'), desc: t('HowSteps.Step2Desc'), color: '#4ECDC4' },
                            { step: '03', icon: <Star className="w-8 h-8" />, title: t('HowSteps.Step3Title'), desc: t('HowSteps.Step3Desc'), color: '#F7B731' },
                        ].map((item) => (
                            <div key={item.step} className="bg-white p-8 rounded-3xl shadow-sm text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 float-1" style={{ backgroundColor: item.color + '22', color: item.color }}>
                                    {item.icon}
                                </div>
                                <div className="text-6xl font-black mb-2" style={{ color: item.color + '30' }}>{item.step}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===================== CTA FINAL ===================== */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="rounded-3xl p-12 border border-orange-100 bg-gradient-to-br from-orange-50 to-teal-50 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200 rounded-full opacity-30 float-1" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-200 rounded-full opacity-30 float-3" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 float-2">
                                <Star className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4">{t('CtaTitle')}</h2>
                            <p className="text-gray-600 mb-2">{t('CtaSub', { episodesCount: totalEpisodes, seriesCount: videoSeries.length })}</p>
                            <p className="text-gray-500 mb-8" dangerouslySetInnerHTML={{ __html: t.raw('CtaDesc') }} />
                            <Link href="/cle-usb/commander"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-xl hover:scale-105 transition-all pulse-cta"
                                style={{ backgroundColor: '#FF6B6B' }}
                            >
                                <Usb className="w-6 h-6" />
                                {t('CtaBtn')}
                            </Link>
                            <p className="text-gray-400 text-sm mt-4">{t('CtaFooter')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to top + interactions client */}
            <UsbInteractive menuItems={menu?.items} />

            <Footer />
        </div>
    )
}
