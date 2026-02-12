import { Link } from '@/i18n/routing'
import { BookOpen, MapPin, User, Star, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

// ... interfaces remain same ...
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

export default function MarketBookCard({ book, isSmartMatch }: { book: MarketBook; isSmartMatch?: boolean }) {
    const t = useTranslations('Community.Market')
    const tbf = useTranslations('Community.BookForm')

    if (!book.owner) return null // Should not happen for market books

    return (
        <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            {/* Owner Info (Top) */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                        {book.owner.image ? (
                            <img src={book.owner.image} alt={book.owner.fullName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                                {book.owner.fullName?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{t('Owner')}</p>
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
            <Link href={`/community/market/${book.id}`} className="block aspect-[2/3] bg-gray-50 rounded-2xl mb-4 overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                {book.image ? (
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <BookOpen className="w-10 h-10 opacity-20" />
                    </div>
                )}

                {/* Condition Badge */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-lg">
                        {tbf(`Conditions.${book.condition}`)}
                    </div>
                    {isSmartMatch && (
                        <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg animate-pulse">
                            <Sparkles className="w-2.5 h-2.5" /> {t('Mutual')}
                        </div>
                    )}
                </div>
            </Link>

            {/* Book Info */}
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <Link href={`/community/market/${book.id}`}>
                        <h3 className="font-black text-lg text-black leading-tight mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors" title={book.title}>
                            {book.title}
                        </h3>
                    </Link>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 line-clamp-1">{book.author}</p>
                </div>

                <Link
                    href={`/community/market/${book.id}`}
                    className="w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                >
                    {t('Request')}
                </Link>
            </div>
        </div>
    )
}
