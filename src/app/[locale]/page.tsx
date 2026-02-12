import { getPopularBooks, getBestSellerBooks, getBestAuthors } from '@/lib/db/books'
import { getPopularPacks } from '@/lib/db/packs'
import { getAllCategoryQuotes } from '@/lib/actions/categories'
import { getRecentExchangeBooks } from '@/lib/actions/community-market'
import Header from '@/components/HeaderWithUser'
import BookCard from '@/components/BookCard'
import PackCard from '@/components/PackCard'
import TrustSection from '@/components/TrustSection'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { ArrowRight, BookOpen, Package, Truck, Shield, Sparkles, Quote, TrendingUp, Users, RefreshCw } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('HomePage');

  return {
    title: t('seo.Title'),
    description: t('seo.Description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr': '/fr',
        'ar': '/ar',
        'en': '/en',
      },
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('HomePage');

  const [popularBooks, newBooks, popularPacks, bestSellerBooks, bestAuthors, exchangeBooks, allQuotes, totalBooks, totalUsers, totalExchanges] = await Promise.all([
    getPopularBooks(6),
    getPopularBooks(8), // Simuler "nouveautés"
    getPopularPacks(3),
    getBestSellerBooks(6),
    getBestAuthors(4),
    getRecentExchangeBooks(6),
    getAllCategoryQuotes(),
    prisma.book.count({ where: { active: true } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.exchange.count({ where: { status: 'COMPLETED' } }),
  ])

  // Choisir une citation au hasard
  const randomQuote = allQuotes.length > 0
    ? allQuotes[Math.floor(Math.random() * allQuotes.length)]
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Riwaya',
    url: 'https://riwaya.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://riwaya.com/books?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      {/* ... Hero Section ... */}
      <section className="relative overflow-hidden bg-pixio-cream pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
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

            <div className="flex-1 relative w-full lg:w-auto">
              <ScrollReveal animation="animate-reveal-right" delay={400} className="relative w-full aspect-square max-w-lg mx-auto transform hover:scale-105 transition-transform duration-700">
                <div className="absolute inset-0 bg-pixio-cream rounded-[3rem] rotate-6 animate-float-slow"></div>
                <div className="absolute inset-0 bg-pixio-yellow rounded-[4rem] -rotate-3 translate-x-4 animate-float"></div>
                <div className="absolute inset-0 bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-2xl z-10">
                  {popularBooks.length > 0 ? (
                    <>
                      <div className="relative w-full h-full">
                        <Image
                          src={popularBooks[0].image}
                          alt={popularBooks[0].title}
                          fill
                          className="object-cover"
                          priority
                          unoptimized
                        />
                      </div>
                      <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-xl">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{t('hero.EditorsChoice')}</p>
                        <h3 className="text-xl font-black text-black truncate">{popularBooks[0].title}</h3>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg font-black text-black">{popularBooks[0].price} MAD</span>
                          <Link
                            href={`/books/${popularBooks[0].id}`}
                            className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                          >
                            {t('hero.Select')}
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                      <BookOpen className="w-32 h-32 opacity-10" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
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

      {/* Best Seller Books */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={100} className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-[11px] font-black uppercase text-orange-600 tracking-[0.3em]">
                  {t('BestSellers.Subtitle')}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                {t('BestSellers.Title')}<span className="text-orange-500">.</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl">
                {t('BestSellers.Description')}
              </p>
            </div>
            <Link
              href="/books"
              className="flex items-center gap-2 text-black hover:text-gray-600 font-black text-xs uppercase tracking-widest group px-6 py-3 border-2 border-black rounded-full transition-all hover:bg-black hover:text-white"
            >
              <span>{t('BestSellers.ViewAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          {bestSellerBooks.length === 0 ? (
            <ScrollReveal delay={300} className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
                {t('BestSellers.Soon')}
              </p>
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
      </section >

      {/* Inspirational Quote Section */}
      {randomQuote && (
        <section className="py-24 bg-pixio-yellow relative overflow-hidden">
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
                <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">
                  — {randomQuote.quoteSource}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mt-2">
                  {t('Quotes.FeaturedIn')} <span className="text-black">{randomQuote.name}</span>
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Collections - Style Pixio (Background coloré) */}
      <section className="py-24 bg-pixio-cream overflow-hidden">
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

      {/* Best Authors - Premium Editorial Design */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pixio-yellow/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10 animate-float-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between mb-24 gap-12">
            <ScrollReveal className="space-y-6 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full">
                <Users className="w-4 h-4 text-pixio-yellow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  {t('BestAuthors.Subtitle')}
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.8] mb-4">
                {t('BestAuthors.Title')}<span className="text-pixio-yellow">.</span>
              </h2>
              <p className="text-xl text-gray-400 font-medium tracking-tight">
                {t('BestAuthors.Description')}
              </p>
            </ScrollReveal>

            <ScrollReveal animation="animate-reveal-right" delay={300}>
              <Link
                href="/books"
                className="group flex items-center gap-4 bg-pixio-cream px-8 py-4 rounded-full border border-gray-100 hover:border-black transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
              >
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
              <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em]">
                {t('BestAuthors.NoData')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
              {bestAuthors.map((author: any, idx: number) => (
                <ScrollReveal key={author.author} delay={idx * 150} animation="animate-reveal-up">
                  <Link
                    href={`/books?search=${encodeURIComponent(author.author)}`}
                    className="group relative flex flex-col pt-12"
                  >
                    {/* Rank Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-7xl font-black text-pixio-yellow/40 leading-none group-hover:text-amber-400/60 transition-colors duration-500">
                        0{idx + 1}
                      </span>
                      <div className="h-px flex-grow bg-gray-100 group-hover:bg-amber-100 transition-colors"></div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-[3rem] p-8 xl:p-10 shadow-xl shadow-black/5 hover:shadow-black/10 border border-gray-50 transition-all duration-500 group-hover:-translate-y-4">
                      <div className="relative flex flex-col items-center">
                        {/* Author Image - Overlapping look */}
                        <div className="relative w-32 h-32 -mt-20 mb-8 z-10">
                          <div className="absolute inset-0 bg-black rounded-full rotate-6 group-hover:rotate-12 transition-transform duration-500 scale-105"></div>
                          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                            {author.sampleBook?.image ? (
                              <Image
                                src={author.sampleBook.image}
                                alt={author.author}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Users className="w-10 h-10 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-black tracking-tight mb-8 text-center px-4">
                          {author.author}
                        </h3>

                        {/* Glassmorphism Stats */}
                        <div className="w-full grid grid-cols-2 gap-4">
                          <div className="relative p-6 bg-pixio-cream rounded-3xl overflow-hidden group/stat">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-3xl font-black text-black tracking-tighter mb-1 relative z-10">{author.totalSold}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] relative z-10">
                              {t('BestAuthors.BooksSold')}
                            </p>
                          </div>
                          <div className="relative p-6 bg-pixio-yellow/30 rounded-3xl overflow-hidden group/stat">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-3xl font-black text-amber-600 tracking-tighter mb-1 relative z-10">{author.bookCount}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] relative z-10">
                              {author.bookCount > 1 ? t('BestAuthors.BooksPlural') : t('BestAuthors.BookSingular')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Action Badge */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-4 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                      <div className="bg-black text-white px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                        <span>{t('BestAuthors.ViewBooks')}</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Platform Section */}
      <TrustSection
        stats={{
          books: totalBooks + 500, // Ajout d'offset pour le décollage
          readers: totalUsers + 1000,
          exchanges: totalExchanges + 200
        }}
      />

      {/* Arrival - Newest Books */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={100} className="flex items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">{t('NewArrivals.Subtitle')}</span>
              <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                {t('NewArrivals.Title')}
              </h2>
            </div>
            <Link
              href="/books"
              className="flex items-center gap-2 text-black hover:text-gray-600 font-black text-xs uppercase tracking-widest group px-6 py-3 border-2 border-black rounded-full transition-all hover:bg-black hover:text-white"
            >
              <span>{t('NewArrivals.ViewAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {newBooks.map((book: any, idx: number) => (
              <ScrollReveal key={book.id} delay={idx * 100} animation="animate-reveal-up">
                <BookCard
                  {...book}
                  variant={idx === 0 ? 'featured' : 'default'}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Books for Exchange */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-teal-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span className="text-[11px] font-black uppercase text-green-600 tracking-[0.3em]">
                  {t('ExchangeBooks.Subtitle')}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                {t('ExchangeBooks.Title')}<span className="text-green-500">.</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl">
                {t('ExchangeBooks.Description')}
              </p>
            </div>
            <Link
              href="/community/market"
              className="group flex items-center gap-4 px-10 py-4 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-all shadow-xl hover:-translate-y-1"
            >
              <span>{t('ExchangeBooks.ViewAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          {exchangeBooks.length === 0 ? (
            <ScrollReveal delay={300} className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-green-200">
              <RefreshCw className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-4">
                {t('ExchangeBooks.NoData')}
              </p>
              <Link
                href="/community/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-all shadow-lg"
              >
                <span>{t('ExchangeBooks.JoinCommunity')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </ScrollReveal>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exchangeBooks.map((book: any, idx: number) => (
                  <ScrollReveal key={book.id} delay={idx * 150} animation="animate-reveal-up">
                    <Link
                      href={`/community/market/${book.id}`}
                      className="group h-full relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-500 flex flex-col"
                    >
                      {/* Book Image */}
                      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                        {book.image ? (
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100">
                            <BookOpen className="w-20 h-20 text-green-300" />
                          </div>
                        )}

                        {/* Condition Badge */}
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-green-600 border border-green-200">
                          {book.condition}
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-lg font-black text-black mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-400 font-bold italic mb-4">
                          {book.author}
                        </p>

                        {/* Owner Info */}
                        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                            {book.owner?.image ? (
                              <Image
                                src={book.owner.image}
                                alt={book.owner.fullName}
                                width={32}
                                height={32}
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-green-600 font-black text-xs">
                                {book.owner?.fullName?.[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex-grow">
                            <p className="text-xs font-bold text-gray-600 truncate">
                              {book.owner?.fullName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold">
                              {book.owner?.city}
                            </p>
                          </div>
                          {book.owner?.rating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                              <Sparkles className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                              <span className="text-xs font-black text-yellow-600">
                                {book.owner.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Exchange Type */}
                        <div className="mt-4 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-black text-green-600 uppercase tracking-wider">
                            {book.exchangeType}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>

              {/* View More Button */}
              <ScrollReveal delay={500} className="flex justify-center mt-12">
                <Link
                  href="/community/market"
                  className="group inline-flex items-center gap-4 px-12 py-6 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-green-700 transition-all shadow-2xl hover:scale-105 hover:-translate-y-1"
                >
                  <span>{t('ExchangeBooks.ViewMore')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </ScrollReveal>
            </>
          )}
        </div>
      </section>

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

      {/* Quick Searches Section */}
      <section className="py-16 bg-pixio-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={100} className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-gray-100 rounded-full shadow-sm mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                {t('QuickSearches.Title')}
              </span>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-3">
            {(t.raw('QuickSearches.Searches') as string[]).map((search, index) => (
              <ScrollReveal key={index} delay={index * 50} animation="animate-reveal-up" className="inline-block">
                <Link
                  href={`/books?search=${encodeURIComponent(search)}`}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-700 hover:text-black transition-all hover:shadow-md hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="tracking-wide">{search}</span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
