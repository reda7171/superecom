import { getPopularBooks, getBestSellerBooks, getBestAuthors } from '@/lib/db/books'
import { getPopularPacks } from '@/lib/db/packs'
import { isFeatureEnabled } from '@/lib/actions/site-settings'
import { getAllCategoryQuotes } from '@/lib/actions/categories'
import { getRecentExchangeBooks } from '@/lib/actions/community-market'
import { getRecentPosts } from '@/lib/actions/blog'
import HeaderWithUser from '@/components/HeaderWithUser'
import BookCard from '@/components/BookCard'
import PackCard from '@/components/PackCard'
import TrustSection from '@/components/TrustSection'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import { Link, redirect } from '@/i18n/routing'
import { normalizeImage } from '@/lib/utils'
import { ArrowRight, BookOpen, Package, Truck, Shield, Sparkles, Quote, TrendingUp, Users, RefreshCw, FileText, Zap, Download } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import GiftPopup from '@/components/GiftPopup'
import ImageWithFallback from '@/components/ImageWithFallback'
import AuthorsCarousel from '@/components/AuthorsCarousel'
import CosmosBooks from '@/components/CosmosBooks'
import CatalogDownload from '@/components/home/CatalogDownload'
import CatalogPublicWrapper from '@/components/home/CatalogPublicWrapper'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('HomePage.seo');

  const title = t('Title');
  const description = t('Description');

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr': '/fr',
        'ar': '/ar',
        'en': '/en',
      },
    },
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      locale: locale === 'ar' ? 'ar_MA' : locale === 'en' ? 'en_MA' : 'fr_MA',
      url: `https://riwaya.store/${locale}`,
      siteName: 'Riwaya',
      images: [
        {
          url: 'https://riwaya.store/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const t = await getTranslations('HomePage');
  const tDigital = await getTranslations('DigitalBooks');

  // Optimisation: Regrouper les queries similaires et utiliser le cache
  const [
    popularBooks,
    popularPacks,
    bestSellerBooks,
    bestAuthors,
    exchangeBooks,
    allQuotes,
    stats,
    featureDigitalBooks,
    featureExchange,
    recentPosts,
    homeSettings
  ] = await Promise.all([
    getPopularBooks(8),
    getPopularPacks(3),
    getBestSellerBooks(4),
    getBestAuthors(8),
    getRecentExchangeBooks(6),
    getAllCategoryQuotes(),
    prisma.$transaction([
      prisma.book.count({ where: { active: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.exchange.count({ where: { status: 'COMPLETED' } }),
    ]),
    isFeatureEnabled('feature_digital_books'),
    isFeatureEnabled('feature_exchange'),
    getRecentPosts(3, locale),
    import('@/lib/actions/site-settings').then(m => m.getSettingsByCategory('homepage_sections'))
  ])

  const [totalBooks, totalUsers, totalExchanges] = stats
  const newBooks = popularBooks.slice(0, 6)
  const showSection = (key: string) => homeSettings[key] !== 'false'

  const getSectionProps = (key: string, defaultBg: string) => {
    const bg = homeSettings[`bg_${key}`] || defaultBg
    if (bg.startsWith('#') || bg.startsWith('rgb')) {
      return { style: { backgroundColor: bg } }
    }
    return { className: bg }
  }

  // Alerte Telegram Visite Accueil
  try {
    const { getSetting } = await import('@/lib/actions/site-settings')
    const shouldNotify = await getSetting('telegram_notify_home_visit') === 'true'

    if (shouldNotify) {
      const { sendTelegramMessage } = await import('@/lib/telegram')
      await sendTelegramMessage(`🏠 <b>Visite Accueil</b> (${locale.toUpperCase()})\n📅 ${new Date().toLocaleString('fr-FR')}`)
    }
  } catch (e) {
    // Ignorer les erreurs de notification
  }

  // Choisir une citation de manière déterministe (fix hydration error by not relying on Date.now() in SSR)
  let randomQuote = null;
  if (allQuotes.length > 0) {
    // on utilise la date "fixée" par SSR + calculs, ou on la fixe côté serveur sans changer côté client.
    // L'idéal: prendre un mod basé sur la longueur totale des stats (une valeur db fixe plutôt que l'heure)
    const seed = totalExchanges + totalBooks;
    randomQuote = allQuotes[seed % allQuotes.length];
  }

  // Structured Data pour SEO
  const jsonLd: { '@context': string; '@graph': any[] } = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://riwaya.store/#organization',
        name: 'Riwaya',
        url: 'https://riwaya.store',
        logo: {
          '@type': 'ImageObject',
          url: 'https://riwaya.store/logo.png',
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://instagram.com/itsmereda1',
          'https://facebook.com/riwaya',
          'https://twitter.com/riwaya_ma',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          telephone: '+212-XXX-XXXXXX',
          areaServed: 'MA',
          availableLanguage: ['French', 'Arabic', 'English'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://riwaya.store/#localbusiness',
        name: 'Riwaya',
        image: 'https://riwaya.store/og-image.jpg',
        url: 'https://riwaya.store',
        telephone: '+212-XXX-XXXXXX',
        priceRange: '50 MAD - 500 MAD',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Casablanca',
          addressLocality: 'Casablanca',
          addressRegion: 'Grand Casablanca',
          postalCode: '20000',
          addressCountry: 'MA',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 33.5731,
          longitude: -7.5898,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:00',
          closes: '22:00',
        },
        paymentAccepted: 'Cash on Delivery',
        currenciesAccepted: 'MAD',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://riwaya.store/#website',
        url: 'https://riwaya.store',
        name: 'Riwaya',
        description: 'Librairie en ligne au Maroc - Achetez et échangez des livres',
        publisher: {
          '@id': 'https://riwaya.store/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://riwaya.store/books?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: ['fr-MA', 'ar-MA', 'en-MA'],
      },
      {
        '@type': 'ItemList',
        '@id': 'https://riwaya.store/#products',
        name: 'Livres disponibles',
        numberOfItems: totalBooks,
        itemListElement: popularBooks.slice(0, 5).map((book, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Book',
            '@id': `https://riwaya.store/books/${book.id}`,
            name: book.title,
            author: {
              '@type': 'Person',
              name: book.author,
            },
            image: book.image,
            offers: {
              '@type': 'Offer',
              price: book.price,
              priceCurrency: 'MAD',
              availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: {
                '@id': 'https://riwaya.store/#organization',
              },
            },
          },
        })),
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Livrez-vous partout au Maroc ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, nous livrons nos livres dans toutes les villes et régions du Maroc avec des partenaires logistiques rapides et fiables.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels moyens de paiement acceptez-vous ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous privilégions votre sécurité en proposant le paiement à la livraison (Cash on Delivery). Vous ne payez que lorsque vous recevez vos livres en main propre.',
        },
      },
      {
        '@type': 'Question',
        name: 'Combien dure la livraison ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La livraison prend généralement entre 24h et 48h ouvrables, selon votre adresse exacte au Maroc.',
        },
      },
    ],
  };

  jsonLd['@graph'].push(faqSchema);



  const defaultOrder = [
    'home_section_hero',
    'home_section_custom_html',
    'home_section_features',
    'home_section_best_sellers',
    'home_section_quote',
    'home_section_packs',
    'home_section_authors',
    'home_section_trust',
    'home_section_new_arrivals',
    'home_section_exchange',
    'home_section_digital',
    'home_section_blog'
  ]
  const sectionsOrder = homeSettings['home_sections_order']
    ? homeSettings['home_sections_order'].split(',').filter(k => defaultOrder.includes(k))
    : defaultOrder

  // Ensure missing sections are added at the end
  const finalOrder = [...sectionsOrder, ...defaultOrder.filter(k => !sectionsOrder.includes(k))]

  const renderSection = (key: string) => {
    if (!showSection(key)) return null

    switch (key) {
      case 'home_section_hero':
        const heroProps = getSectionProps('home_section_hero', 'bg-pixio-cream');
        return (
          <section key={key} {...heroProps} className={`relative overflow-hidden py-1 ${heroProps.className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <ScrollReveal animation="animate-reveal-up" delay={200} className="space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-black text-xs font-black uppercase tracking-widest shadow-sm border border-gray-100 pulse-yellow-glow mx-auto lg:mx-0">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>{t('hero.Badge')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-[0.9] tracking-tighter">
                      {t('hero.TitlePart1')} <br />
                      <span className="text-gray-400">{t('hero.TitlePart2')}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-xl font-medium tracking-tight mx-auto lg:mx-0">
                      {t('hero.Description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Link href="/books" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/40 hover:-translate-y-1">
                        <span>{t('hero.ShopLibrary')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link href="/packs" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full border-2 border-gray-100 hover:border-black transition-all hover:-translate-y-1">
                        <span>{t('hero.OurBundles')}</span>
                      </Link>
                    </div>
                  </ScrollReveal>
                </div>
                <div className="flex-1 relative w-full lg:w-auto flex items-center justify-center overflow-hidden">
                  {(() => {
                    const cosmosValidBooks = popularBooks.filter(book => {
                      const img = book.image ? book.image.trim() : '';
                      if (!img || img.includes('book-placeholder.png') || img === '/book-placeholder.png') return false;
                      const normalized = img.startsWith('http') || img.startsWith('data:') || img.startsWith('/') ? img : `data:image/jpeg;base64,${img}`;
                      return normalized && !normalized.includes('book-placeholder.png');
                    });
                    if (cosmosValidBooks.length === 0) return null;
                    return (
                      <CosmosBooks
                        centerBook={cosmosValidBooks[0]}
                        books={cosmosValidBooks}
                        locale={locale}
                        autoRotateCenter={true}
                        autoRotateInterval={7000}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>
        )

      case 'home_section_custom_html':
        if (!homeSettings['home_custom_html_content']) return null
        return (
          <section
            key={key}
            {...getSectionProps('home_section_custom_html', 'bg-white')}
            dangerouslySetInnerHTML={{ __html: homeSettings['home_custom_html_content'] }}
          />
        )

      case 'home_section_features':
        return (
          <section key={key} {...getSectionProps('home_section_features', 'bg-white')} className={`py-24 ${getSectionProps('home_section_features', 'bg-white').className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { icon: Truck, title: t('Features.ShippingTitle'), desc: t('Features.ShippingDesc'), color: 'bg-pixio-cream' },
                  { icon: Shield, title: t('Features.PaymentTitle'), desc: t('Features.PaymentDesc'), color: 'bg-pixio-yellow' },
                  { icon: Package, title: t('Features.PacksTitle'), desc: t('Features.PacksDesc'), color: 'bg-pixio-beige' }
                ].map((feature, idx) => (
                  <ScrollReveal key={idx} delay={idx * 150} className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-20 h-20 ${feature.color} rounded-[2rem] flex items-center justify-center group hover:rotate-6 transition-transform shadow-sm hover:shadow-xl`}>
                      <feature.icon className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-lg font-black text-black tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{feature.desc}</p>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )

      case 'home_section_best_sellers':
        return (
          <section key={key} {...getSectionProps('home_section_best_sellers', 'bg-white')} className={`py-24 ${getSectionProps('home_section_best_sellers', 'bg-white').className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal delay={100} className="flex flex-col items-center text-center mb-16 space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-[11px] font-black uppercase text-orange-600 tracking-[0.3em]">
                      {t('BestSellers.Subtitle')}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                    {t('BestSellers.Title')}<span className="text-orange-500">.</span>
                  </h2>
                  <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                    {t('BestSellers.Description')}
                  </p>
                </div>
                <Link href="/books" className="group flex items-center gap-4 bg-pixio-cream px-8 py-3 rounded-full border border-gray-100 hover:border-black transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest text-black">{t('BestSellers.ViewAll')}</span>
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </ScrollReveal>
              {bestSellerBooks.length === 0 ? (
                <ScrollReveal delay={300} className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">{t('BestSellers.Soon')}</p>
                </ScrollReveal>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {bestSellerBooks.map((book: any, idx: number) => (
                    <ScrollReveal key={book.id} delay={idx * 100} animation="animate-reveal-up">
                      <BookCard {...book} />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </section>
        )

      case 'home_section_quote':
        if (!randomQuote) return null
        return (
          <section key={key} {...getSectionProps('home_section_quote', 'bg-pixio-yellow')} className={`py-24 relative overflow-hidden ${getSectionProps('home_section_quote', 'bg-pixio-yellow').className || ''}`}>
            <ScrollReveal animation="animate-reveal-up" delay={100} className="relative z-10">
              <Quote className="absolute -top-10 -right-10 w-64 h-64 text-white opacity-50 -rotate-12" />
              <Quote className="absolute -bottom-10 -left-10 w-64 h-64 text-white opacity-50 rotate-12" />
              <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                  <Sparkles className="w-4 h-4 text-pixio-yellow" />
                  {t('Quotes.WisdomOfTheDay')}
                </div>
                <p className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tighter mb-10 italic">
                  "{randomQuote.quote}"
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-1 bg-black rounded-full mb-4"></div>
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">— {randomQuote.quoteSource}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mt-2">
                    {t('Quotes.FeaturedIn')} <span className="text-black">{randomQuote.name}</span>
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )

      case 'home_section_packs':
        return (
          <section key={key} {...getSectionProps('home_section_packs', 'bg-pixio-cream')} className={`py-24 overflow-hidden ${getSectionProps('home_section_packs', 'bg-pixio-cream').className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal delay={100} className="flex flex-col items-center text-center mb-16 space-y-4">
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">{t('Collections.Subtitle')}</span>
                <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                  {t('Collections.Title')}<span className="text-pixio-pink">.</span>
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {popularPacks.map((pack: any, idx: number) => (
                  <ScrollReveal key={pack.id} delay={idx * 150} animation="animate-reveal-up">
                    <PackCard {...pack} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )

      case 'home_section_authors':
        return (
          <section key={key} {...getSectionProps('home_section_authors', 'bg-white')} className={`py-32 relative overflow-hidden ${getSectionProps('home_section_authors', 'bg-white').className || ''}`}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pixio-yellow/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10 animate-float-slow"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between mb-24 gap-12">
                <ScrollReveal className="space-y-6 text-center lg:text-left max-w-2xl">
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full">
                    <Users className="w-4 h-4 text-pixio-yellow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('BestAuthors.Subtitle')}</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.8] mb-4">
                    {t('BestAuthors.Title')}<span className="text-pixio-yellow">.</span>
                  </h2>
                  <p className="text-xl text-gray-400 font-medium tracking-tight">{t('BestAuthors.Description')}</p>
                </ScrollReveal>
                <ScrollReveal animation="animate-reveal-right" delay={300}>
                  <Link href="/books" className="group flex items-center gap-4 bg-pixio-cream px-8 py-4 rounded-full border border-gray-100 hover:border-black transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl">
                    <span className="text-xs font-black uppercase tracking-widest text-black">{t('BestAuthors.BooksPlural')}</span>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </ScrollReveal>
              </div>
              {bestAuthors.length === 0 ? (
                <div className="text-center py-32 bg-pixio-cream rounded-[4rem] border-2 border-dashed border-gray-100">
                  <Users className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                  <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em]">{t('BestAuthors.NoData')}</p>
                </div>
              ) : (
                <AuthorsCarousel authors={bestAuthors} />
              )}
            </div>
          </section>
        )

      case 'home_section_trust':
        return (
          <TrustSection
            key={key}
            {...getSectionProps('home_section_trust', 'bg-white')}
            stats={{
              books: totalBooks + 500,
              readers: totalUsers + 1000,
              exchanges: totalExchanges + 200
            }}
          />
        )

      case 'home_section_new_arrivals':
        return (
          <section key={key} {...getSectionProps('home_section_new_arrivals', 'bg-white')} className={`py-24 overflow-hidden ${getSectionProps('home_section_new_arrivals', 'bg-white').className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal delay={100} className="flex items-end justify-between mb-16 gap-8">
                <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">{t('NewArrivals.Subtitle')}</span>
                  <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">{t('NewArrivals.Title')}</h2>
                </div>
                <Link href="/books" className="group flex items-center gap-4 bg-pixio-cream px-6 py-3 rounded-full border border-gray-100 hover:border-black transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest text-black">{t('NewArrivals.ViewAll')}</span>
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                {newBooks.map((book: any, idx: number) => (
                  <ScrollReveal key={book.id} delay={idx * 100} animation="animate-reveal-up">
                    <BookCard {...book} variant={idx === 0 ? 'featured' : 'default'} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )

      case 'home_section_exchange':
        if (!featureExchange) return null
        return (
          <section key={key} {...getSectionProps('home_section_exchange', 'bg-gradient-to-br from-green-50 to-teal-50')} className={`py-24 overflow-hidden ${getSectionProps('home_section_exchange', 'bg-gradient-to-br from-green-50 to-teal-50').className || ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full">
                    <RefreshCw className="w-4 h-4 text-green-600" />
                    <span className="text-[11px] font-black uppercase text-green-600 tracking-[0.3em]">{t('ExchangeBooks.Subtitle')}</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                    {t('ExchangeBooks.Title')}<span className="text-green-500">.</span>
                  </h2>
                  <p className="text-lg text-gray-500 font-medium max-w-2xl">{t('ExchangeBooks.Description')}</p>
                </div>
                <Link href="/community/market" className="group flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-green-100 hover:border-green-600 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
                  <span className="text-xs font-black uppercase tracking-widest text-green-600">{t('ExchangeBooks.ViewAll')}</span>
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </ScrollReveal>
              {exchangeBooks.length === 0 ? (
                <ScrollReveal delay={300} className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-green-200">
                  <RefreshCw className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-4">{t('ExchangeBooks.NoData')}</p>
                  <Link href="/community/login" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-all shadow-lg">
                    <span>{t('ExchangeBooks.JoinCommunity')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </ScrollReveal>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exchangeBooks.map((book: any, idx: number) => (
                      <ScrollReveal key={book.id} delay={idx * 150} animation="animate-reveal-up">
                        <Link href={`/community/market/${book.id}`} className="group h-full relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-500 flex flex-col">
                          <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                            {book.image ? <ImageWithFallback src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100"><BookOpen className="w-20 h-20 text-green-300" /></div>}
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-green-600 border border-green-200">{book.condition}</div>
                          </div>
                          <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-lg font-black text-black mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">{book.title}</h3>
                            <p className="text-sm text-gray-400 font-bold italic mb-4">{book.author}</p>
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                                {book.owner?.image ? <ImageWithFallback src={book.owner.image} alt={book.owner.fullName} className="w-full h-full object-cover" /> : <span className="text-green-600 font-black text-xs">{book.owner?.fullName?.[0]}</span>}
                              </div>
                              <div className="flex-grow">
                                <p className="text-xs font-bold text-gray-600 truncate">{book.owner?.fullName}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{book.owner?.city}</p>
                              </div>
                              {book.owner?.rating > 0 && <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full"><Sparkles className="w-3 h-3 text-yellow-600 fill-yellow-600" /><span className="text-xs font-black text-yellow-600">{book.owner.rating.toFixed(1)}</span></div>}
                            </div>
                            <div className="mt-4 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-green-600" /><span className="text-xs font-black text-green-600 uppercase tracking-wider">{book.exchangeType}</span></div>
                          </div>
                        </Link>
                      </ScrollReveal>
                    ))}
                  </div>
                  <ScrollReveal delay={500} className="flex justify-center mt-12">
                    <Link href="/community/market" className="group inline-flex items-center gap-4 px-12 py-6 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-all shadow-2xl hover:scale-105 hover:-translate-y-1">
                      <span>{t('ExchangeBooks.ViewMore')}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </ScrollReveal>
                </>
              )}
            </div>
          </section>
        )

      case 'home_section_digital':
        if (!featureDigitalBooks) return null
        return (
          <section key={key} {...getSectionProps('home_section_digital', 'bg-black')} className={`py-24 overflow-hidden relative ${getSectionProps('home_section_digital', 'bg-black').className || ''}`}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/5 rounded-full blur-[120px]" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                  <ScrollReveal animation="animate-reveal-up" delay={100}><div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full"><Zap className="w-3 h-3 text-amber-400" /><span className="text-[11px] font-black uppercase text-amber-400 tracking-[0.3em]">{tDigital('HomeSection.Badge')}</span></div></ScrollReveal>
                  <ScrollReveal animation="animate-reveal-up" delay={200}><h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">{tDigital('HomeSection.Title')}<span className="text-amber-400">.</span></h2></ScrollReveal>
                  <ScrollReveal animation="animate-reveal-up" delay={300}><p className="text-lg text-gray-400 font-medium max-w-lg leading-relaxed">{tDigital('HomeSection.Description')}</p></ScrollReveal>
                  <ScrollReveal animation="animate-reveal-up" delay={400} className="space-y-4">
                    {[
                      { icon: Download, label: tDigital('HomeSection.Feature1') },
                      { icon: FileText, label: tDigital('HomeSection.Feature2') },
                      { icon: Shield, label: tDigital('HomeSection.Feature3') },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3"><div className="w-8 h-8 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0"><item.icon className="w-4 h-4 text-amber-400" /></div><span className="text-sm font-bold text-gray-300">{item.label}</span></div>
                    ))}
                  </ScrollReveal>
                  <ScrollReveal animation="animate-reveal-up" delay={500}><Link href="/livres-numeriques" className="group inline-flex items-center gap-4 px-10 py-5 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-300 transition-all shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-1 hover:scale-105"><span>{tDigital('HomeSection.CTA')}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link></ScrollReveal>
                </div>
                <ScrollReveal animation="animate-reveal-right" delay={300} className="flex-1 flex justify-center lg:justify-end">
                  <div className="relative w-72 h-80">
                    {[
                      { z: 1, rotate: '-8deg', ty: '16px', tx: '-12px', opacity: 0.4 },
                      { z: 2, rotate: '4deg', ty: '8px', tx: '8px', opacity: 0.6 },
                      { z: 3, rotate: '0deg', ty: '0px', tx: '0px', opacity: 1 },
                    ].map((card, i) => (
                      <div key={i} className="absolute inset-4 rounded-3xl border border-amber-400/20 bg-gray-900 flex flex-col items-center justify-center gap-6 p-8" style={{ zIndex: card.z, transform: `rotate(${card.rotate}) translateY(${card.ty}) translateX(${card.tx})`, opacity: card.opacity }}>
                        {i === 2 && (<><div className="w-20 h-20 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center"><FileText className="w-10 h-10 text-amber-400" /></div><div className="space-y-2 w-full"><div className="h-2 bg-amber-400/30 rounded-full" /><div className="h-2 bg-white/10 rounded-full w-4/5" /><div className="h-2 bg-white/10 rounded-full w-3/5" /><div className="h-2 bg-white/10 rounded-full w-2/3" /></div><div className="flex items-center gap-2 px-4 py-2 bg-amber-400 rounded-full"><Download className="w-4 h-4 text-black" /><span className="text-black text-xs font-black uppercase tracking-wider">PDF</span></div></>)}
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>
        )

      case 'home_section_blog':
        if (!recentPosts || recentPosts.length === 0) return null
        return (
          <section key={key} {...getSectionProps('home_section_blog', 'bg-white')} className={`py-32 relative overflow-hidden ${getSectionProps('home_section_blog', 'bg-white').className || ''}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-50 opacity-[0.03] select-none pointer-events-none whitespace-nowrap">JOURNAL RIWAYA</div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                <ScrollReveal className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-pixio-cream rounded-full"><FileText className="w-4 h-4 text-black" /><span className="text-[11px] font-black uppercase text-black tracking-[0.3em]">{t('Journal.Subtitle') || 'Notre Journal'}</span></div>
                  <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.9]">{t('Journal.TitlePart1') || 'Derniers Articles'}<br /><span className="text-gray-400 italic">{t('Journal.TitlePart2') || 'à Découvrir'}</span></h2>
                </ScrollReveal>
                <ScrollReveal animation="animate-reveal-right">
                  <Link href="/blog" className="group flex items-center gap-4 bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1"><span className="text-xs font-black uppercase tracking-widest">{t('Journal.ViewAll') || 'Tout Lire'}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                </ScrollReveal>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {recentPosts.map((post: any, idx: number) => (
                  <ScrollReveal key={post.id} delay={idx * 150} animation="animate-reveal-up">
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <article className="h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {post.coverImage ? (
                            <ImageWithFallback 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                          ) : (
                            <div className="w-full h-full bg-pixio-cream flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-6 left-6">
                            <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', { day: 'numeric', month: 'long' })}
                            </div>
                          </div>
                        </div>
                        <div className="p-8 flex-grow flex flex-col">
                          <div className="flex items-center gap-2 mb-4"><div className="w-1.5 h-1.5 rounded-full bg-black" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{post.category?.name || 'Inspiration'}</span></div>
                          <h3 className="text-2xl font-black text-black leading-tight mb-4 group-hover:text-gray-600 transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-8">{post.excerpt}</p>
                          <div className="mt-auto flex items-center gap-2 text-black font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all"><span>{t('Journal.ReadMore') || 'Lire la suite'}</span><ArrowRight className="w-4 h-4" /></div>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <>
      <GiftPopup />
      <HeaderWithUser />
      <main className="min-h-screen bg-white">
        {finalOrder.map(key => renderSection(key))}

        {/* Newsletter / CTA - Style Pixio Banner */}
        <section className="py-24 bg-black overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pixio-beige/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-float"></div>
          <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
              {t('CTA.TitlePart1')} <br />
              <span className="text-gray-400 italic">{t('CTA.TitlePart2')}</span>
            </h2>
            <Link
              href="/books"
              className="group inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-pixio-cream transition-all shadow-2xl hover:scale-105 hover:-translate-y-1 pulse-yellow-glow"
            >
              <span>{t('CTA.Button')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </section>

        <CatalogPublicWrapper />
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
    </>
  )
}
