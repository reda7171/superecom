'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { addToWishlist, removeFromWishlist } from '@/lib/actions/community-wishlist'
import { Plus, Trash2, Loader2, BookMarked } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/store/ui'
import { useWishlistStore } from '@/store/wishlist'

interface WishlistSectionProps {
    wishlist: any[]
}

export default function WishlistSection({ wishlist }: WishlistSectionProps) {
    const t = useTranslations('Community.Wishlist')
    const { showNotification } = useUIStore()
    const [showForm, setShowForm] = useState(false)
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [optimisticWishlist, updateOptimisticWishlist] = useOptimistic(
        wishlist,
        (state, { type, item, id }: { type: 'ADD' | 'DELETE', item?: any, id?: string }) => {
            if (type === 'ADD') return [...state, item]
            if (type === 'DELETE') return state.filter(i => i.id !== id)
            return state
        }
    )

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const author = formData.get('author') as string

        startTransition(async () => {
            updateOptimisticWishlist({
                type: 'ADD',
                item: { id: Math.random().toString(), title, author, isOptimistic: true }
            })
            setShowForm(false)
            await addToWishlist(formData)
            showNotification(t('Success'))
            router.refresh()
        })
    }

    const { removeItem } = useWishlistStore()

    async function handleRemove(id: string, bookId?: string) {
        startTransition(async () => {
            updateOptimisticWishlist({ type: 'DELETE', id })
            // Supprimer de la DB
            await removeFromWishlist(id)
            // Supprimer du store local (Zustand) pour l'en-tête
            if (bookId) {
                removeItem(bookId)
            } else {
                removeItem(id)
            }
            router.refresh()
        })
    }

    const currentWishlist = optimisticWishlist

    return (
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-xl shadow-black/5 mb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-black tracking-tight">{t('Title')}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={() => startTransition(() => setShowForm(!showForm))}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
                >
                    <Plus className={`w-5 h-5 transition-transform ${showForm ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('BookTitle')}</label>
                            <input
                                name="title"
                                required
                                placeholder="ex: L'Alchimiste"
                                className="w-full px-5 py-3 bg-white border-2 border-transparent rounded-2xl focus:border-black outline-none transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Author')}</label>
                            <input
                                name="author"
                                placeholder="ex: Paulo Coelho"
                                className="w-full px-5 py-3 bg-white border-2 border-transparent rounded-2xl focus:border-black outline-none transition-all font-bold text-sm"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-black text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('AddBook')}
                    </button>
                </form>
            )}

            {currentWishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentWishlist.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-black rounded-2xl transition-all">
                            <div className="min-w-0">
                                <h3 className={`font-black text-sm text-black truncate ${item.isOptimistic ? 'opacity-50' : ''}`}>{item.title}</h3>
                                {item.author && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{item.author}</p>}
                            </div>
                            <button
                                onClick={() => handleRemove(item.id, item.bookId)}
                                disabled={isPending}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border-dashed border-2 border-gray-200">
                    <p className="text-gray-400 font-bold text-sm">{t('Empty')}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-1">{t('MatchingNote')}</p>
                </div>
            )}
        </div>
    )
}
