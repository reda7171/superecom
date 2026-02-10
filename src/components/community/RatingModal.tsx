'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Star, X, Loader2 } from 'lucide-react'
import { createRating } from '@/lib/actions/community-ratings'
import { useRouter } from '@/i18n/routing'

interface RatingModalProps {
    exchangeId: string
    isOpen: boolean
    onClose: () => void
}

export default function RatingModal({ exchangeId, isOpen, onClose }: RatingModalProps) {
    const t = useTranslations('Community.Ratings')
    const router = useRouter()
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('exchangeId', exchangeId)
        formData.append('rating', rating.toString())
        formData.append('comment', comment)

        const res = await createRating(formData)

        if (res.success) {
            router.refresh()
            onClose()
        } else {
            setError(res.error || 'An error occurred')
            setLoading(null as any)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-black mb-1">{t('Title')}</h2>
                        <p className="text-sm text-gray-400 font-bold">{t('Subtitle')}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Stars */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none group"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all duration-300 ${star <= rating
                                                ? 'text-yellow-400 fill-yellow-400 scale-110'
                                                : 'text-gray-200 group-hover:text-yellow-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-black text-black bg-gray-50 px-4 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                            {rating} / 5
                        </span>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                            {t('CommentLabel')}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('Placeholder')}
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-[1.5rem] p-4 text-sm font-bold text-black outline-none transition-all min-h-[120px] resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-bold text-red-500 text-center px-4">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            t('Submit')
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
