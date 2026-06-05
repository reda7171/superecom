'use client'

import { useState } from 'react'
import { addComment } from '@/lib/actions/comments'
import { MessageSquare, Send, User, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

interface Comment {
    id: string
    content: string
    createdAt: Date
    authorName?: string | null
    user?: {
        fullName: string | null
        image: string | null
    } | null
}

interface CommentsSectionProps {
    postId: string
    comments: any[]
    totalCount: number
}

export default function CommentsSection({ postId, comments, totalCount }: CommentsSectionProps) {
    const [content, setContent] = useState('')
    const [authorName, setAuthorName] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const t = useTranslations('BlogComments')
    const locale = useLocale()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        const result = await addComment(postId, content, authorName)
        setLoading(false)

        if (result.success) {
            setContent('')
            setAuthorName('')
            setMessage({ type: 'success', text: result.message || t('CommentSent') })
        } else {
            setMessage({ type: 'error', text: result.error || t('ErrorOccurred') })
        }
    }

    return (
        <section className="mt-20 pt-20 border-t border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-black mb-10 flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                {t('CommentsTitle')} ({totalCount})
            </h2>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="mb-16 bg-pixio-cream/50 p-8 rounded-[2rem]">
                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-6">{t('LeaveComment')}</h3>
                
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder={t('YourName')}
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-black outline-none transition-all font-medium text-sm"
                    />
                    <textarea
                        placeholder={t('YourMessage')}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-black outline-none transition-all font-medium text-sm resize-none"
                    />
                    
                    {message && (
                        <p className={`text-xs font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {t('SubmitComment')}
                    </button>
                </div>
            </form>

            {/* Liste des commentaires */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <p className="text-center text-gray-400 font-medium text-sm italic">{t('NoComments')}</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-6">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                {comment.user?.image ? (
                                    <Image src={comment.user.image} alt="" width={48} height={48} className="object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-sm font-black text-black">
                                        {comment.user?.fullName || comment.authorName || t('Anonymous')}
                                    </h4>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {new Date(comment.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
