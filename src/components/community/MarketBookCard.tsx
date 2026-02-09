import { Link } from '@/i18n/routing'
import { BookOpen, MapPin, User, Star } from 'lucide-react'

// Define a type aligned with the Prisma query result
interface MarketUser {
    id: string
    fullName: string | null
    city: string | null
    image: string | null
    rating: number
}

interface MarketBook {
    id: string
    title: string
    author: string
    image: string | null
    condition: string
    exchangeType: string
    status: string
    createdAt: Date
    owner?: MarketUser | null
}

export default function MarketBookCard({ book }: { book: MarketBook }) {
    if (!book.owner) return null // Should not happen for market books

    return (
        <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            {/* Owner Info (Top) */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                        {book.owner.image ? (
                            <img src={book.owner.image} alt={book.owner.fullName || 'User'} className="w-full h-ful object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                                {book.owner.fullName?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Propriétaire</p>
                        <p className="text-xs font-bold text-black truncate max-w-[100px]">{book.owner.fullName}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full mb-1">
                        <MapPin className="w-3 h-3" /> {book.owner.city}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-yellow-500" /> {book.owner.rating.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Book Image */}
            <div className="aspect-[2/3] bg-gray-50 rounded-2xl mb-4 overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                {book.image ? (
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <BookOpen className="w-10 h-10 opacity-20" />
                    </div>
                )}

                {/* Condition Badge */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-lg">
                    {book.condition}
                </div>
            </div>

            {/* Book Info */}
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-black text-lg text-black leading-tight mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors" title={book.title}>
                        {book.title}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 line-clamp-1">{book.author}</p>
                </div>

                <Link
                    href={`/community/exchange/request/${book.id}`}
                    className="w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg hover:bg-gray-800 active:scale-95 transition-all group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 duration-300"
                >
                    Demander l'échange
                </Link>
            </div>

            {/* Mobile Fallback for Button (Visible on Touch) -> Handled by CSS opacity rules usually, but here we force visible on mobile if needed by media query. For now, keep hover effect for desktop. */}
        </div>
    )
}
