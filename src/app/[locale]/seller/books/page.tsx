import { getSellerBooks } from '@/lib/actions/seller/dashboard'
import { Plus, BookOpen, MapPin, Eye, Trash2 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { normalizeImage } from '@/lib/utils'

export default async function SellerBooksPage() {
    const books = await getSellerBooks()

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tighter uppercase tracking-tight">Mon Catalogue</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Gérez vos articles mis en vente</p>
                </div>
                <Link 
                    href="/seller/books/new" 
                    className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter
                </Link>
            </div>

            {/* Books Grid */}
            {books.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-24 text-center border-dashed border-4 border-gray-100 group transition-all hover:border-black/5">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-xl">
                        <BookOpen className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter">Votre boutique est vide</h3>
                    <p className="text-gray-400 font-bold text-sm max-w-md mx-auto mb-10">Commencez dès maintenant en ajoutant votre premier livre sur le Marketplace Riwaya.</p>
                    <Link href="/seller/books/new" className="inline-flex bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95">Propulser mon premier livre</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-2 transition-all group flex flex-col h-full min-h-[450px]">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 relative bg-gray-50 shadow-inner">
                                <img 
                                    src={normalizeImage(book.image)} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${book.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {book.active ? 'En ligne' : 'Inactif'}
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <Link href={`/books/${book.id}`} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                                        <Eye className="w-5 h-5 text-black" />
                                    </Link>
                                    <button className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                                        <Trash2 className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-grow">
                                <h3 className="font-black text-lg text-black mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">{book.title}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{book.author}</p>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Prix</span>
                                    <span className="text-xl font-black text-black tracking-tighter">{book.price.toFixed(2)} MAD</span>
                                </div>
                                <div className="bg-pixio-cream px-3 py-2 rounded-xl flex items-center gap-2">
                                    <span className="text-[10px] font-black text-black uppercase tracking-tighter">{book.stock} EN STOCK</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
