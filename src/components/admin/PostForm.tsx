'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, updatePost } from '@/lib/actions/blog'
import { uploadPostImage } from '@/lib/actions/upload'
import { Loader2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface PostFormProps {
    post?: any
    isEditing?: boolean
}

export default function PostForm({ post, isEditing = false }: PostFormProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [title, setTitle] = useState(post?.title || '')
    const [slug, setSlug] = useState(post?.slug || '')
    const [excerpt, setExcerpt] = useState(post?.excerpt || '')
    const [content, setContent] = useState(post?.content || '')
    const [published, setPublished] = useState(post?.published || false)
    const [coverImage, setCoverImage] = useState(post?.coverImage || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setError(null)

        try {
            const data = {
                title,
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                excerpt,
                content,
                coverImage,
                published
            }

            const result = isEditing
                ? await updatePost(post.id, data)
                : await createPost(data)

            if (result.success) {
                router.push('/admin/posts')
                router.refresh()
            } else {
                setError(result.error as string)
            }
        } catch (err) {
            setError('Une erreur est survenue')
        } finally {
            setIsPending(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert("L'image est trop volumineuse (max 5MB)")
            return
        }

        const formData = new FormData()
        formData.append('image', file)

        setIsPending(true)
        try {
            const result = await uploadPostImage(formData)
            if (result.success && result.imageUrl) {
                setCoverImage(result.imageUrl)
            } else {
                alert(result.error || "Erreur lors de l'upload")
            }
        } catch (err) {
            alert("Erreur lors de l'upload")
        } finally {
            setIsPending(false)
        }
    }

    // Auto-generate slug from title if slug is empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!isEditing && !slug) {
            setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Link
                    href="/fr/admin/posts"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Mettre à jour' : 'Publier'}
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Titre</label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                placeholder="Titre de l'article"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-sm text-gray-600"
                                placeholder="titre-de-l-article"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Extrait</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                placeholder="Bref résumé de l'article..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Contenu (Markdown)</label>
                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={15}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-sm"
                                    placeholder="# Titre du contenu..."
                                    required
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                                    Markdown supporté
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900">Publication</h3>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="published"
                                checked={published}
                                onChange={(e) => setPublished(e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <label htmlFor="published" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                Publier cet article
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900">Image de couverture</h3>

                        {coverImage ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setCoverImage('')}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ) : (
                            <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs">Aucune image</span>
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button
                                type="button"
                                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors pointer-events-none"
                            >
                                Choisir une image
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            JPG, PNG, WebP (Max 5MB)
                        </p>
                    </div>
                </div>
            </div>
        </form>
    )
}
