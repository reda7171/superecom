'use client'

import { useState, useMemo } from 'react'
import { Book as BookType } from '@prisma/client'
import { X, Search, Check, ShoppingBag, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import ImageWithFallback from '@/components/ImageWithFallback'

interface CustomPackBuilderProps {
    availableBooks: BookType[]
}

export default function CustomPackBuilder({ availableBooks }: CustomPackBuilderProps) {
    const t = useTranslations('Packs')
    const tCommon = useTranslations('Common')
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBooks, setSelectedBooks] = useState<BookType[]>([])
    
    const addItem = useCartStore((state) => state.addItem)
    const showNotification = useUIStore((state) => state.showNotification)

    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return availableBooks
        const query = searchQuery.toLowerCase()
        return availableBooks.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query)
        )
    }, [availableBooks, searchQuery])

    const toggleBook = (book: BookType) => {
        setSelectedBooks(prev => {
            const isSelected = prev.some(b => b.id === book.id)
            if (isSelected) {
                return prev.filter(b => b.id !== book.id)
            } else {
                return [...prev, book]
            }
        })
    }

    const discountPercentage = selectedBooks.length >= 5 ? 15 : selectedBooks.length >= 3 ? 10 : 0
    const subtotal = selectedBooks.reduce((sum, b) => sum + b.price, 0)
    const discountAmount = (subtotal * discountPercentage) / 100
    const finalPrice = subtotal - discountAmount

    const handleAddToCart = () => {
        if (selectedBooks.length < 3) return

        selectedBooks.forEach(book => {
            // Apply the proportional discount to each book
            const discountedPrice = book.price * (1 - discountPercentage / 100)
            
            addItem({
                id: book.id,
                title: `${t('CustomPack.CartPrefix')} ${book.title}`,
                price: discountedPrice,
                image: book.image || '',
                type: 'BOOK'
            })
        })
        
        showNotification(tCommon('AddedToCartSuccess'), 'success')
        setIsOpen(false)
        setSelectedBooks([])
    }

    return (
        <>
            {/* Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-8 md:p-12 rounded-[2.5rem] shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 text-center md:text-left space-y-4 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                        <SparklesIcon className="w-4 h-4 text-yellow-400" />
                        {t('Exclusive')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white">{t('CustomPack.BannerTitle')}</h2>
                    <p className="text-gray-300 font-medium">{t('CustomPack.BannerDesc')}</p>
                </div>
                
                <button 
                    onClick={() => setIsOpen(true)}
                    className="relative z-10 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    {t('CustomPack.BannerBtn')}
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-2xl font-black text-black">{t('CustomPack.ModalTitle')}</h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">{t('CustomPack.SelectBooks')}</p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Left: Book List */}
                            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder={t('CustomPack.SearchPlaceholder')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                                    {filteredBooks.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-400 font-medium">{t('CustomPack.NoBooksFound')}</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {filteredBooks.map(book => {
                                                const isSelected = selectedBooks.some(b => b.id === book.id)
                                                return (
                                                    <div 
                                                        key={book.id}
                                                        onClick={() => toggleBook(book)}
                                                        className={`relative group cursor-pointer rounded-2xl border-2 transition-all overflow-hidden ${
                                                            isSelected ? 'border-black bg-gray-50' : 'border-transparent hover:border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="aspect-[2/3] relative bg-gray-100">
                                                            <ImageWithFallback 
                                                                src={book.image || ''} 
                                                                alt={book.title}
                                                                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                                                            />
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                                        <Check className="w-6 h-6 text-black" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-3 text-center">
                                                            <p className="text-xs font-bold text-black line-clamp-2 leading-tight mb-1">{book.title}</p>
                                                            <p className="text-[10px] text-gray-500 truncate">{book.author}</p>
                                                            <p className="text-xs font-black text-black mt-2">{book.price} MAD</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Summary */}
                            <div className="w-full lg:w-96 bg-gray-50 flex flex-col p-6 shrink-0 h-[40vh] lg:h-auto overflow-y-auto lg:overflow-visible">
                                <h4 className="text-lg font-black text-black mb-6 flex items-center justify-between">
                                    {t('CustomPack.Selected')}
                                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">
                                        {selectedBooks.length}
                                    </span>
                                </h4>
                                
                                <div className="flex-1 overflow-y-auto space-y-3 mb-6 scrollbar-none">
                                    {selectedBooks.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                                            <ShoppingBag className="w-12 h-12 opacity-20" />
                                            <p className="text-sm font-medium text-center">{t('CustomPack.SelectBooks')}</p>
                                        </div>
                                    ) : (
                                        selectedBooks.map(book => (
                                            <div key={`selected-${book.id}`} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                                                <div className="w-12 h-16 relative bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                    <ImageWithFallback src={book.image || ''} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-black truncate">{book.title}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{book.author}</p>
                                                    <p className="text-sm font-black text-black mt-1">{book.price} MAD</p>
                                                </div>
                                                <button 
                                                    onClick={() => toggleBook(book)}
                                                    className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                                        <span>{t('RegularPrice')}</span>
                                        <span>{subtotal.toFixed(2)} MAD</span>
                                    </div>
                                    
                                    {discountPercentage > 0 && (
                                        <div className="flex justify-between items-center text-sm font-bold text-green-500">
                                            <span>{discountPercentage === 15 ? t('CustomPack.Discount15') : t('CustomPack.Discount10')}</span>
                                            <span>-{discountAmount.toFixed(2)} MAD</span>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-100 w-full" />
                                    
                                    <div className="flex justify-between items-center text-lg font-black text-black">
                                        <span>{t('PackPrice')}</span>
                                        <span>{finalPrice.toFixed(2)} MAD</span>
                                    </div>

                                    {/* Next tier hint */}
                                    {selectedBooks.length < 3 ? (
                                        <p className="text-xs text-center text-gray-500 font-medium bg-gray-50 py-2 rounded-lg">
                                            {t('CustomPack.AddMoreFor10', { count: 3 - selectedBooks.length })}
                                        </p>
                                    ) : selectedBooks.length < 5 ? (
                                        <p className="text-xs text-center text-gray-500 font-medium bg-gray-50 py-2 rounded-lg">
                                            {t('CustomPack.AddMoreFor15', { count: 5 - selectedBooks.length })}
                                        </p>
                                    ) : null}

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={selectedBooks.length < 3}
                                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                                            selectedBooks.length >= 3 
                                                ? 'bg-black text-white hover:shadow-lg hover:-translate-y-1' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {t('CustomPack.AddToCart', { price: finalPrice.toFixed(2) })}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
