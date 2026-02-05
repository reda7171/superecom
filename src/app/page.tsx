import { getPopularBooks } from '@/lib/db/books'
import { getPopularPacks } from '@/lib/db/packs'
import { getAllCategoryQuotes } from '@/lib/actions/categories'
import Header from '@/components/Header'
import BookCard from '@/components/BookCard'
import PackCard from '@/components/PackCard'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowRight, BookOpen, Package, Truck, Shield, Sparkles, Quote } from 'lucide-react'

export default async function HomePage() {
  const [popularBooks, newBooks, popularPacks, allQuotes] = await Promise.all([
    getPopularBooks(6),
    getPopularBooks(8), // Simuler "nouveautés"
    getPopularPacks(3),
    getAllCategoryQuotes(),
  ])

  // Choisir une citation au hasard
  const randomQuote = allQuotes.length > 0
    ? allQuotes[Math.floor(Math.random() * allQuotes.length)]
    : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* ... Hero Section ... */}
      <section className="relative overflow-hidden bg-pixio-cream pt-16 pb-32">
        {/* Hero code remains same, I'll use placeholders if needed but I'm editing the middle */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-black text-xs font-black uppercase tracking-widest shadow-sm border border-gray-100">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Curated Selections 2024</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-[0.9] tracking-tighter">
                Beautiful <br />
                <span className="text-gray-400">Knowledge.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl font-medium tracking-tight">
                Discover a premium selection of volumes that transform your view of the world. Knowledge, with style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/books" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20">
                  <span>Shop Library</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/packs" className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full border-2 border-gray-100 hover:border-black transition-all">
                  <span>Our Bundles</span>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-pixio-cream rounded-[3rem] rotate-6"></div>
                <div className="absolute inset-0 bg-pixio-yellow rounded-[4rem] -rotate-3 translate-x-4"></div>
                <div className="absolute inset-0 bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-2xl z-10">
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200 p-12">
                    <BookOpen className="w-full h-full opacity-10" />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur rounded-[2rem] border border-white shadow-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Editor's Choice</p>
                    <h3 className="text-xl font-black text-black">The Timeless Guide</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-black text-black">129 MAD</span>
                      <button className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Select</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-pixio-cream rounded-[2rem] flex items-center justify-center group hover:rotate-6 transition-transform">
                <Truck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-black text-black tracking-tight">Express Shipping</h3>
              <p className="text-sm text-gray-500 font-medium">Pan-Morocco coverage in record time.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-pixio-yellow rounded-[2.5rem] flex items-center justify-center group hover:-rotate-6 transition-transform">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-black text-black tracking-tight">Secured Payment</h3>
              <p className="text-sm text-gray-500 font-medium">Pay on delivery with full confidence.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-pixio-beige rounded-[2rem] flex items-center justify-center group hover:scale-110 transition-transform">
                <Package className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-black text-black tracking-tight">Premium Packs</h3>
              <p className="text-sm text-gray-500 font-medium">Curated selections at architected prices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirational Quote Section */}
      {randomQuote && (
        <section className="py-32 bg-pixio-cream relative overflow-hidden">
          <Quote className="absolute -top-10 -right-10 w-64 h-64 text-white opacity-50 -rotate-12" />
          <Quote className="absolute -bottom-10 -left-10 w-64 h-64 text-white opacity-50 rotate-12" />

          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12">
              <Sparkles className="w-4 h-4 text-pixio-yellow" />
              Wisdom of the day
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
                Featured in <span className="text-black">{randomQuote.name}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Collections - Style Pixio (Background coloré) */}
      <section className="py-24 bg-pixio-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">Curated Selections</span>
            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
              Nos Collections<span className="text-pixio-pink">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {popularPacks.map((pack) => (
              <PackCard key={pack.id} {...pack} />
            ))}
          </div>
        </div>
      </section>

      {/* Arrival - Newest Books */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">New Season</span>
              <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight">
                Derniers Arrivages
              </h2>
            </div>
            <Link
              href="/books"
              className="hidden md:flex items-center gap-2 text-black hover:text-gray-600 font-black text-xs uppercase tracking-widest group"
            >
              <span>Tout voir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {newBooks.map((book, idx) => (
              <BookCard
                key={book.id}
                {...book}
                variant={idx === 0 ? 'featured' : 'default'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA - Style Pixio Banner */}
      <section className="py-24 bg-black overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pixio-beige/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Prêt pour votre <br />
            <span className="text-gray-400 italic">prochaine lecture ?</span>
          </h2>
          <Link
            href="/books"
            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-pixio-cream transition-all shadow-2xl hover:scale-105"
          >
            <span>Démarrer maintenant</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
