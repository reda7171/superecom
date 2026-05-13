'use client'

import { usePathname } from 'next/navigation'

interface Book {
    id: string
    title: string
    author: string
    price: number
    image: string
}

interface BookCarouselProps {
    books: Book[]
    t: any
}

export default function BookCarousel({ books, t }: BookCarouselProps) {
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'fr'

    if (!books || books.length === 0) return null

    return (
        <div className="flex gap-3 mt-3 w-full overflow-x-auto no-scrollbar pb-2 snap-x">
            {books.slice(0, 6).map((book) => (
                <div 
                    key={book.id} 
                    className="min-w-[145px] max-w-[145px] bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all group snap-start shadow-sm flex flex-col"
                >
                    <div className="w-full h-36 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm mb-2 relative">
                        <img 
                            src={book.image} 
                            alt={book.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg text-[10px] font-black text-orange-600 shadow-sm border border-orange-100">
                            {book.price} DH
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <p className="font-black text-[12px] text-gray-900 line-clamp-1 leading-tight">{book.title}</p>
                            <p className="text-[10px] text-gray-500 font-bold truncate">{book.author}</p>
                        </div>
                        <a 
                            href={`/${locale}/books/${book.id}`}
                            className="mt-3 w-full py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-gray-200 text-center block"
                        >
                            {t.addToCart}
                        </a>
                    </div>
                </div>
            ))}
        </div>
    )
}
