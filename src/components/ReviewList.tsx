import { Star, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl';

interface Review {
    id: string
    fullName: string
    rating: number
    comment: string
    createdAt: Date
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
    const t = useTranslations('ReviewList');
    const locale = useLocale();

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic">{t('NoReviews')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 leading-none">{review.fullName}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                    {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : (locale === 'fr' ? 'fr-FR' : 'en-US'))}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed italic">
                        "{review.comment}"
                    </p>
                </div>
            ))}
        </div>
    )
}
