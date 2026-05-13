import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import HeaderWithUser from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import ScrollReveal from '@/components/ScrollReveal'
import { prisma } from '@/lib/prisma'
import { ArrowRight, BookOpen, Download, FileText, Star, Zap, Shield, Globe, Search, SortDesc } from 'lucide-react'
import { Metadata } from 'next'
import DigitalProductCard from '@/components/DigitalProductCard'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('DigitalBooks')
  return {
    title: `${t('seo.Title')} | Riwaya`,
    description: t('seo.Description'),
    alternates: {
      canonical: `/${locale}/livres-numeriques`,
    },
  }
}

export default async function DigitalBooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('DigitalBooks')

  // Récupération des produits numériques actifs
  const [featuredProducts, allProducts] = await Promise.all([
    prisma.digitalProduct.findMany({
      where: { active: true, featured: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.digitalProduct.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const totalProducts = await prisma.digitalProduct.count({ where: { active: true } })

  return (
    <>
      <HeaderWithUser />
      <main className="min-h-screen bg-white">

        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-black py-24 md:py-32">
          {/* Fond décoratif */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            {/* Grille de fond */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <ScrollReveal animation="animate-reveal-up" delay={100}>
                  <div className="inline-flex items-center gap-2 px-5 py-2 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-400 text-xs font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" />
                    <span>{t('hero.Badge')}</span>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="animate-reveal-up" delay={200}>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                    {t('hero.TitlePart1')}
                    <br />
                    <span className="text-amber-400">{t('hero.TitlePart2')}</span>
                  </h1>
                </ScrollReveal>

                <ScrollReveal animation="animate-reveal-up" delay={300}>
                  <p className="text-lg md:text-xl text-gray-400 max-w-xl font-medium leading-relaxed">
                    {t('hero.Description')}
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="animate-reveal-up" delay={400}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a
                      href="#catalogue"
                      className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-300 transition-all shadow-xl hover:shadow-amber-400/30 hover:-translate-y-1"
                    >
                      <span>{t('hero.BrowseCatalog')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <Link
                      href="/contact"
                      className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 text-white font-black text-xs uppercase tracking-widest rounded-full border border-white/10 hover:border-amber-400/50 transition-all hover:-translate-y-1"
                    >
                      <span>{t('hero.LearnMore')}</span>
                    </Link>
                  </div>
                </ScrollReveal>

                {/* Stats rapides */}
                <ScrollReveal animation="animate-reveal-up" delay={500}>
                  <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-4">
                    {[
                      { value: `${totalProducts}+`, label: t('hero.stats.Books') },
                      { value: '100%', label: t('hero.stats.Digital') },
                      { value: '< 1 min', label: t('hero.stats.Access') },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center lg:text-left">
                        <p className="text-3xl font-black text-amber-400">{stat.value}</p>
                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Illustration côté droit */}
              <ScrollReveal animation="animate-reveal-right" delay={300} className="flex-1 flex justify-center lg:justify-end">
                <div className="relative w-72 h-72 md:w-96 md:h-96">
                  {/* Stack de livres PDF animé */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[
                      { rotate: '-12deg', translateY: '24px', translateX: '-16px', bg: '#1a1a2e', border: '#fbbf24' },
                      { rotate: '6deg', translateY: '12px', translateX: '8px', bg: '#16213e', border: '#f59e0b' },
                      { rotate: '0deg', translateY: '0px', translateX: '0px', bg: '#0f3460', border: '#fbbf24' },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className="absolute w-48 h-64 md:w-56 md:h-72 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 shadow-2xl"
                        style={{
                          backgroundColor: card.bg,
                          borderColor: card.border,
                          transform: `rotate(${card.rotate}) translateY(${card.translateY}) translateX(${card.translateX})`,
                          zIndex: i + 1,
                        }}
                      >
                        {i === 2 && (
                          <>
                            <div className="w-16 h-16 bg-amber-400/20 rounded-2xl flex items-center justify-center">
                              <FileText className="w-8 h-8 text-amber-400" />
                            </div>
                            <div className="space-y-2 w-32">
                              <div className="h-2 bg-amber-400/40 rounded-full" />
                              <div className="h-2 bg-white/20 rounded-full w-4/5" />
                              <div className="h-2 bg-white/20 rounded-full w-3/5" />
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-400 rounded-full">
                              <Download className="w-3 h-3 text-black" />
                              <span className="text-black text-xs font-black uppercase">PDF</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Badges flottants */}
                  <div className="absolute -top-4 -right-4 bg-amber-400 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-bounce z-20">
                    {t('hero.InstantDownload')}
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg z-20">
                    {t('hero.AllFormats')}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ===== AVANTAGES ===== */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Download,
                  title: t('Features.DownloadTitle'),
                  desc: t('Features.DownloadDesc'),
                  color: 'bg-amber-50',
                  iconColor: 'text-amber-600',
                },
                {
                  icon: Shield,
                  title: t('Features.SecureTitle'),
                  desc: t('Features.SecureDesc'),
                  color: 'bg-green-50',
                  iconColor: 'text-green-600',
                },
                {
                  icon: Globe,
                  title: t('Features.AccessTitle'),
                  desc: t('Features.AccessDesc'),
                  color: 'bg-blue-50',
                  iconColor: 'text-blue-600',
                },
              ].map((f, i) => (
                <ScrollReveal key={i} delay={i * 150} className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-20 h-20 ${f.color} rounded-[2rem] flex items-center justify-center hover:rotate-6 transition-transform shadow-sm hover:shadow-xl`}>
                    <f.icon className={`w-8 h-8 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-black text-black tracking-tight">{f.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{f.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CATALOGUE ===== */}
        <section id="catalogue" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal delay={100} className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px] font-black uppercase text-amber-600 tracking-[0.3em]">
                    {t('Catalog.Subtitle')}
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                  {t('Catalog.Title')}<span className="text-amber-400">.</span>
                </h2>
                <p className="text-gray-500 font-medium max-w-xl">
                  {t('Catalog.Description', { count: totalProducts })}
                </p>
              </div>
            </ScrollReveal>

            {allProducts.length === 0 ? (
              <ScrollReveal delay={200} className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-2">
                  {t('Catalog.Empty')}
                </p>
                <p className="text-gray-300 text-xs">{t('Catalog.EmptyDesc')}</p>
              </ScrollReveal>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {allProducts.map((product: any, idx: number) => (
                  <ScrollReveal key={product.id} delay={idx * 80} animation="animate-reveal-up">
                    <DigitalProductCard product={product} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== COMMENT CA MARCHE ===== */}
        <section className="py-24 bg-black text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-16 space-y-4">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-[0.3em]">{t('HowItWorks.Subtitle')}</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                {t('HowItWorks.Title')}<span className="text-amber-400">.</span>
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: Search,
                  title: t('HowItWorks.Step1Title'),
                  desc: t('HowItWorks.Step1Desc'),
                },
                {
                  step: '02',
                  icon: Star,
                  title: t('HowItWorks.Step2Title'),
                  desc: t('HowItWorks.Step2Desc'),
                },
                {
                  step: '03',
                  icon: Download,
                  title: t('HowItWorks.Step3Title'),
                  desc: t('HowItWorks.Step3Desc'),
                },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 150} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="text-6xl font-black text-amber-400/20 leading-none">{item.step}</div>
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="py-24 bg-amber-400">
          <ScrollReveal className="max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
              {t('CTA.Title')}
            </h2>
            <p className="text-black/70 text-lg font-medium max-w-2xl mx-auto">
              {t('CTA.Description')}
            </p>
            <a
              href="#catalogue"
              className="group inline-flex items-center gap-4 px-12 py-6 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-gray-900 transition-all shadow-2xl hover:scale-105 hover:-translate-y-1"
            >
              <span>{t('CTA.Button')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </ScrollReveal>
        </section>

        <Footer />
      </main>
    </>
  )
}
