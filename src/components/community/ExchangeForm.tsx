'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createExchangeRequest } from '@/lib/actions/community-exchanges'
import { ArrowLeft, BookOpen, Loader2, Coins, RefreshCw } from 'lucide-react'
import { Link } from '@/i18n/routing'

interface ExchangeFormProps {
    details: {
        book: any
        myBooks: any[]
        currentUser: any
    }
}

export default function ExchangeForm({ details }: ExchangeFormProps) {
    const t = useTranslations('Community.Exchange')
    const router = useRouter()

    // State
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [type, setType] = useState<'DIRECT' | 'CREDIT'>('DIRECT')
    const [selectedBook, setSelectedBook] = useState<string>('')

    const { book, myBooks, currentUser } = details

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await createExchangeRequest(formData)

        if (res.success) {
            router.push('/community')
            router.refresh()
        } else {
            setError(res.error)
            setSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

            {/* Left: Book to Request */}
            <div className="lg:w-1/3 bg-gray-50 p-10 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-gray-100 relative">
                <Link href="/community/market" className="absolute top-6 left-6 p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="w-32 h-44 bg-white rounded-xl shadow-md mb-6 flex items-center justify-center overflow-hidden">
                    {book.image ? (
                        <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                        <BookOpen className="w-10 h-10 text-gray-300" />
                    )}
                </div>

                <h2 className="text-xl font-black text-black leading-tight mb-2">{book.title}</h2>
                <p className="text-sm font-bold text-gray-400 mb-6">{book.author}</p>

                <div className="mt-auto pt-6 border-t border-gray-200 w-full">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('Subtitle')}</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-xs">
                            {book.owner.fullName?.[0]}
                        </div>
                        <span className="font-bold text-sm">{book.owner.fullName}</span>
                    </div>
                </div>
            </div>

            {/* Right: Offer Form */}
            <div className="lg:w-2/3 p-10">
                <h1 className="text-3xl font-black text-black tracking-tighter mb-8">{t('Title')}</h1>

                <form onSubmit={onSubmit} className="space-y-8">
                    <input type="hidden" name="bookRequestedId" value={book.id} />

                    {/* Exchange Type Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('YourOffer')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setType('DIRECT')}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${type === 'DIRECT' ? 'border-black bg-black text-white' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="w-5 h-5" />
                                    <span className="font-black text-xs uppercase tracking-widest">Livre contre Livre</span>
                                </div>
                                <p className="text-xs opacity-80 leading-relaxed">Échangez un de vos livres contre celui-ci.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('CREDIT')}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${type === 'CREDIT' ? 'border-black bg-black text-white' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins className="w-5 h-5" />
                                    <span className="font-black text-xs uppercase tracking-widest">Crédits</span>
                                </div>
                                <p className="text-xs opacity-80 leading-relaxed">Utilisez votre solde de crédits (Solde: {currentUser.credits})</p>
                            </button>
                        </div>
                        <input type="hidden" name="type" value={type} />
                    </div>

                    {/* Dynamic Content based on Type */}
                    {type === 'DIRECT' ? (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('SelectBook')}</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <select
                                    name="bookOfferedId"
                                    required
                                    value={selectedBook}
                                    onChange={(e) => setSelectedBook(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black appearance-none"
                                >
                                    <option value="" disabled>Sélectionnez un livre...</option>
                                    {myBooks.map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                                    ))}
                                </select>
                            </div>
                            {myBooks.length === 0 && (
                                <p className="text-red-500 text-xs font-bold mt-2">Vous n'avez aucun livre disponible. <Link href="/community/books/new" className="underline">Ajoutez-en un d'abord.</Link></p>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <p className="text-yellow-800 text-sm font-bold flex items-center gap-2">
                                <Coins className="w-4 h-4" /> Coût estimé : 1 crédit
                            </p>
                            {currentUser.credits < 1 && (
                                <p className="text-red-500 text-xs font-bold mt-2">Solde insuffisant.</p>
                            )}
                        </div>
                    )}

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Message')}</label>
                        <textarea
                            name="message"
                            rows={3}
                            className="w-full p-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black resize-none"
                            placeholder="Bonjour, je suis intéressé par ce livre..."
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || (type === 'DIRECT' && !selectedBook) || (type === 'CREDIT' && currentUser.credits < 1)}
                        className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Submit')}
                    </button>
                </form>
            </div>
        </div>
    )
}
