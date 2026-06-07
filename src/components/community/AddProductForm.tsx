'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addExchangeBook } from '@/lib/actions/community-products'
import { uploadBookImage } from '@/lib/actions/upload'
import { Link } from '@/i18n/routing'
import { ArrowLeft, BookOpen, User, Tag, FileText, Loader2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function AddProductForm({ isEligible = true }: { isEligible?: boolean }) {
    const t = useTranslations('Community.BookForm')
    const tcmn = useTranslations('Common')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)

            // Upload de l'image si sélectionnée
            let imageUrl = ''
            if (selectedImage) {
                const imageFormData = new FormData()
                imageFormData.append('image', selectedImage)
                const uploadResult = await uploadBookImage(imageFormData)

                if (!uploadResult.success) {
                    setError(uploadResult.error || tcmn('Errors.ImageUploadError'))
                    setLoading(false)
                    return
                }

                imageUrl = uploadResult.imageUrl || ''
            }

            // Ajouter l'URL de l'image au formData
            if (imageUrl) {
                formData.set('image', imageUrl)
            }

            const res = await addExchangeBook(formData)

            if (res.success) {
                router.push('/community')
                router.refresh()
            } else {
                setError(res.error)
                setLoading(false)
            }
        } catch (err) {
            setError(tcmn('Errors.UnexpectedError'))
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 relative">
            <Link href="/community" className="absolute top-10 left-10 p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
                <ArrowLeft className="w-5 h-5 text-black" />
            </Link>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-black tracking-tighter mb-2">{t('FormTitle')}</h1>
                {!isEligible && (
                    <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                        {t('EligibilityError')}
                    </p>
                )}
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <fieldset disabled={!isEligible} className="space-y-6">
                    {/* Image Upload */}
                    <ImageUpload
                        onImageSelect={setSelectedImage}
                        onRemove={() => setSelectedImage(null)}
                    />

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Title')}</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                name="title"
                                required
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Author')}</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                name="author"
                                required
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Condition */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Condition')}</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <select
                                    name="condition"
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black appearance-none"
                                >
                                    <option value="NEW">{t('Conditions.NEW')}</option>
                                    <option value="GOOD">{t('Conditions.GOOD')}</option>
                                    <option value="USED">{t('Conditions.USED')}</option>
                                </select>
                            </div>
                        </div>

                        {/* ISBN */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Isbn')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">#</span>
                                <input
                                    name="isbn"
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                                    placeholder="978-..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Description')}</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-6 w-5 h-5 text-gray-300" />
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black resize-none"
                                placeholder="..."
                            />
                        </div>
                    </div>
                </fieldset>

                {error && (
                    <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !isEligible}
                    className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Submit')}
                </button>
            </form>
        </div>
    )
}
