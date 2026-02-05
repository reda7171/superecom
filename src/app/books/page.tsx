import { getBooks, getBookCategories } from '@/lib/db/books'
import { getCategoryConfigByName } from '@/lib/actions/categories'
import { parsePriceFilter } from '@/lib/utils/search'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookCard from '@/components/BookCard'
import { Filter, SlidersHorizontal, Quote, Banknote } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
    category?: string
    search?: string
}

export default async function BooksPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams

    // Parser le prix dans la recherche si elle existe
    const priceFilter = params.search ? parsePriceFilter(params.search) : { minPrice: undefined, maxPrice: undefined, cleanQuery: params.search };

    const [books, categories, categoryConfig] = await Promise.all([
        getBooks({
            category: params.category,
            search: priceFilter.cleanQuery,
            minPrice: priceFilter.minPrice,
            maxPrice: priceFilter.maxPrice,
            active: true,
        }),
        getBookCategories(),
        params.category ? getCategoryConfigByName(params.category) : null
    ])

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            {/* Page Header */}
            <div className="bg-pixio-beige pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-6xl font-black text-black mb-6 tracking-tighter">Library<span className="text-gray-300">.</span></h1>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-10">
                        {books.length} items available
                        {params.category && ` in ${params.category}`}
                    </p>

                    {categoryConfig?.quote && (
                        <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                            <Quote className="absolute -top-4 -left-4 w-24 h-24 text-pixio-cream opacity-50 -rotate-12 transition-transform group-hover:rotate-0" />
                            <div className="relative z-10">
                                <p className="text-xl font-black text-black leading-relaxed tracking-tight mb-6 italic">
                                    "{categoryConfig.quote}"
                                </p>
                                {categoryConfig.quoteSource && (
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                        — {categoryConfig.quoteSource}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-[2.5rem] p-10 sticky top-24 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center">
                                    <SlidersHorizontal className="w-5 h-5" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-black">Filters</h2>
                            </div>

                            {/* Search */}
                            <div className="mb-12">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
                                    Search items
                                </label>
                                <form action="/books" method="get" className="relative group">
                                    <input
                                        type="text"
                                        name="search"
                                        defaultValue={params.search}
                                        placeholder="Title, author..."
                                        className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-black text-xs text-black"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full mt-3 px-6 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl shadow-black/5 active:scale-95"
                                    >
                                        Apply
                                    </button>
                                </form>
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                                    <Filter className="w-3 h-3" />
                                    Categories
                                </h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link
                                            href="/books"
                                            className={`block px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!params.category
                                                ? 'bg-black text-white shadow-xl shadow-black/10'
                                                : 'text-gray-400 hover:bg-pixio-cream/50 hover:text-black'
                                                }`}
                                        >
                                            All Selects
                                        </Link>
                                    </li>
                                    {categories.map((category) => (
                                        <li key={category}>
                                            <Link
                                                href={`/books?category=${encodeURIComponent(category)}`}
                                                className={`block px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${params.category === category
                                                    ? 'bg-black text-white shadow-xl shadow-black/10'
                                                    : 'text-gray-400 hover:bg-pixio-cream/50 hover:text-black'
                                                    }`}
                                            >
                                                {category}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Active Filters */}
                            {(params.category || params.search) && (
                                <div className="mt-10 pt-10 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-black">Active</span>
                                        <Link
                                            href="/books"
                                            className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
                                        >
                                            Reset
                                        </Link>
                                    </div>
                                    <div className="space-y-2">
                                        {params.category && (
                                            <div className="flex items-center justify-between px-4 py-3 bg-pixio-cream/50 border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-black">{params.category}</span>
                                                <Link href="/books" className="text-gray-300 hover:text-black">×</Link>
                                            </div>
                                        )}
                                        {params.search && (
                                            <div className="flex items-center justify-between px-4 py-3 bg-pixio-cream/50 border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-black">"{params.search}"</span>
                                                <Link href={params.category ? `/books?category=${params.category}` : '/books'} className="text-gray-300 hover:text-black">×</Link>
                                            </div>
                                        )}
                                        {(priceFilter.minPrice !== undefined || priceFilter.maxPrice !== undefined) && (
                                            <div className="flex items-center justify-between px-4 py-3 bg-pixio-yellow/30 border border-pixio-yellow/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-2">
                                                    <Banknote className="w-3 h-3" />
                                                    <span className="text-black">
                                                        {priceFilter.minPrice && priceFilter.maxPrice
                                                            ? `${priceFilter.minPrice}-${priceFilter.maxPrice} MAD`
                                                            : priceFilter.maxPrice
                                                                ? `< ${priceFilter.maxPrice} MAD`
                                                                : `> ${priceFilter.minPrice} MAD`
                                                        }
                                                    </span>
                                                </div>
                                                <Link href={params.category ? `/books?category=${params.category}` : '/books'} className="text-black/30 hover:text-black">×</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Books Grid */}
                    <div className="flex-1">
                        {books.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100">
                                <div className="w-24 h-24 bg-pixio-cream rounded-full flex items-center justify-center mx-auto mb-10">
                                    <Filter className="w-10 h-10 text-black/10" />
                                </div>
                                <h3 className="text-2xl font-black text-black mb-4">No volumes found</h3>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">
                                    Our collection is empty for these filters.
                                </p>
                                <Link
                                    href="/books"
                                    className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-800 transition-all shadow-2xl"
                                >
                                    Empty filters
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Results Header */}
                                <div className="flex items-center justify-between mb-12 px-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                        <span className="text-black">{books.length}</span> Results
                                    </p>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-10">
                                    {books.map((book) => (
                                        <BookCard key={book.id} {...book} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
