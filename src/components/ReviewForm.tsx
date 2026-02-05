'use client'

import { useState } from 'react'
import { createReview } from '@/lib/actions/reviews'
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react'

export default function ReviewForm({ bookId }: { bookId: string }) {
    const [rating, setRating] = useState(5)
    const [hover, setHover] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            bookId,
            fullName: formData.get('fullName') as string,
            rating,
            comment: formData.get('comment') as string,
        }

        const res = await createReview(data)
        setIsLoading(false)

        if (res.success) {
            setIsSuccess(true)
        } else {
            setError(res.error)
        }
    }

    if (isSuccess) {
        return (
            <div className="bg-green-50 border-2 border-green-100 p-8 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-green-900">Merci pour votre avis !</h3>
                <p className="text-sm font-bold text-green-700 italic">Votre témoignage aide les autres lecteurs à faire le bon choix.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Laissez votre avis</h3>

            <div className="space-y-4">
                <label className="text-xs font-black uppercase text-gray-400 block ml-1">Note globale</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="transition-transform active:scale-90"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hover || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-200'
                                    } transition-colors`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Nom complet</label>
                <input
                    name="fullName"
                    required
                    placeholder="Ex: Ahmed Benali"
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Votre commentaire</label>
                <textarea
                    name="comment"
                    required
                    rows={4}
                    placeholder="Qu'avez-vous pensé de ce livre ?"
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold min-h-[120px]"
                />
            </div>

            {error && <p className="text-xs text-red-600 font-bold italic ml-1">⚠️ {error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Envoyer l'avis
            </button>
        </form>
    )
}
