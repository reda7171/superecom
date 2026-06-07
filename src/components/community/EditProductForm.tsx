'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateExchangeBook, deleteExchangeBook } from '@/lib/actions/community-products'
import { uploadBookImage } from '@/lib/actions/upload'
import { Link } from '@/i18n/routing'
import { ArrowLeft, BookOpen, User, Tag, FileText, Loader2, Trash2, ShieldAlert } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function EditProductForm({ product }: { product: any }) {
    const t = useTranslations('Community.BookForm')
    const tcmn = useTranslations('Common')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
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

            if (imageUrl) {
                formData.set('image', imageUrl)
            } else if (product.image) {
                formData.set('image', product.image) // Garder l'ancienne image
            }

            const res = await updateExchangeBook(product.id, formData)

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

    async function handleDelete() {
        if (!confirm(t('ConfirmDelete') || 'Êtes-vous sûr de vouloir supprimer ce livre ?')) return
        
        setDeleteLoading(true)
        setError(null)
        
        const res = await deleteExchangeBook(product.id)
        
        if (res.success) {
            router.push('/community')
            router.refresh()
        } else {
            setError(res.error)
            setDeleteLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 relative">
            <Link href="/community" className="absolute top-10 left-10 p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
                <ArrowLeft className="w-5 h-5 text-black" />
            </Link>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-black tracking-tighter mb-2">{t('EditFormTitle') || 'Modifier le livre'}</h1>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <fieldset className="space-y-6">
                    {/* Status Toggle */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Status.Label') || 'Statut'}</label>
                        <div className="relative">
                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <select
                                name="status"
                                defaultValue={product.status}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black appearance-none"
                            >
                                <option value="AVAILABLE">{t('Status.AVAILABLE') || 'Disponible'}</option>
                                <option value="HIDDEN">{t('Status.HIDDEN') || 'Masqué'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <ImageUpload
                        onImageSelect={setSelectedImage}
                        onRemove={() => setSelectedImage(null)}
                        currentImage={product.image}
                    />

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Title')}</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                name="title"
                                defaultValue={product.title}
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
                                defaultValue={product.author}
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
                                    defaultValue={product.condition}
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
                                    defaultValue={product.isbn || ''}
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
                                defaultValue={product.description}
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

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || deleteLoading}
                        className="flex-1 bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('SaveChanges') || 'Sauvegarder'}
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading || deleteLoading}
                        className="w-16 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-black rounded-2xl shadow-sm border border-red-100 transition-all flex items-center justify-center disabled:opacity-50 shrink-0 group"
                        title={t('Delete') || 'Supprimer'}
                    >
                        {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    </button>
                </div>
            </form>
        </div>
    )
}
