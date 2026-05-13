'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createPost, updatePost } from '@/lib/actions/blog'
import { uploadPostImage } from '@/lib/actions/upload'
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react'
import { generatePostContent } from '@/lib/actions/gemini'
import Link from 'next/link'
import { Book as BookIcon, Search, X } from 'lucide-react'
import { fetchBooks } from '@/lib/actions/books'
import { useEffect } from 'react'

const BOOK_TEMPLATE = `# [Titre du Livre]

## 1. Introduction
[Présentation rapide du livre et pourquoi il mérite l'attention]

## 2. Informations générales
- **Titre :** 
- **Auteur :** 
- **Genre :** 
- **Date de publication :** 
- **Nombre de pages :** 
- **Éditeur :** 
- **Série / tome :** 
- **Langue originale :** 

## 3. Résumé du livre
[Résumé court sans spoiler]

## 4. Les personnages
- **Personnage principal :** 
- **Personnages secondaires :** 

## 5. Les thèmes abordés
- [Thème 1]
- [Thème 2]

## 6. Style d'écriture
[Fluidité, narration, dialogues, etc.]

## 7. Les points forts
- 

## 8. Les points faibles
- 

## 9. Citation(s) marquante(s)
> " "

## 10. Analyse / interprétation
[Symbolisme, message caché, etc.]

## 11. Comparaison
[Si vous avez aimé X, vous aimerez Y]

## 12. Adaptation
[Film, Série, Anime...]

## 13. Pour quel type de lecteur ?
[Débutants, fans de fantasy, etc.]

## 14. Note finale / avis personnel
- **Histoire :** /5
- **Personnages :** /5
- **Style :** /5
- **Immersion :** /5
- **Fin :** /5

**Note globale : ⭐ /5**

---
### FAQ
- **Le livre vaut-il le coup ?** 
- **Y a-t-il des spoilers ?** 
- **À partir de quel âge ?** 
`

interface PostFormProps {
    post?: any
    isEditing?: boolean
}

export default function PostForm({ post, isEditing = false }: PostFormProps) {
    const router = useRouter()
    const { locale } = useParams()
    const lang = typeof locale === 'string' ? locale : 'fr'
    const [isPending, setIsPending] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [title, setTitle] = useState(post?.title || '')
    const [slug, setSlug] = useState(post?.slug || '')
    const [category, setCategory] = useState(post?.category || '')
    const [excerpt, setExcerpt] = useState(post?.excerpt || '')
    const [content, setContent] = useState(post?.content || '')
    const [published, setPublished] = useState(post?.published || false)
    const [coverImage, setCoverImage] = useState(post?.coverImage || '')
    const [tags, setTags] = useState(post?.tags || '')
    const [language, setLanguage] = useState(post?.language || lang)
    const [allBooks, setAllBooks] = useState<any[]>([])
    const [bookSearch, setBookSearch] = useState('')
    const [selectedBookIds, setSelectedBookIds] = useState<string[]>(post?.books?.map((b: any) => b.id) || [])

    useEffect(() => {
        const loadBooks = async () => {
            const result = await fetchBooks({ limit: 1000, includeInactive: true })
            if (result.success) {
                setAllBooks(result.data)
            }
        }
        loadBooks()
    }, [])

    const handleFieldGenerate = async (lang: 'fr' | 'ar', type: 'TITLE' | 'EXCERPT' | 'CONTENT' | 'SLUG') => {
        const input = type === 'TITLE' ? title : title
        
        if (!input && type !== 'TITLE') {
            alert('Veuillez d\'abord saisir un titre ou des mots-clés.')
            return
        }

        setIsGenerating(true)
        setError(null)
        try {
            const result = await generatePostContent(input || title, lang, type)
            if (result.success && result.content) {
                if (type === 'TITLE') {
                    setTitle(result.content)
                    if (!isEditing) {
                        setSlug(result.content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                    }
                } else if (type === 'SLUG') {
                    setSlug(result.content.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                } else if (type === 'EXCERPT') {
                    setExcerpt(result.content)
                } else {
                    setContent(result.content)
                    if (!excerpt) {
                        setExcerpt(result.content.replace(/[#*`]/g, '').slice(0, 160) + '...')
                    }
                }
            } else {
                setError(result.error || 'Erreur lors de la génération')
            }
        } catch (err) {
            setError('Erreur lors de la génération')
        } finally {
            setIsGenerating(false)
        }
    }

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
                published,
                category,
                tags,
                language,
                bookIds: selectedBookIds
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

    const handleApplyTemplate = () => {
        if (content && !confirm('Cela remplacera le contenu actuel. Continuer ?')) return
        setContent(BOOK_TEMPLATE)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${lang}/admin/posts`}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Link>
                    <a
                        href={isEditing ? `/${lang}/blog/${slug}` : `/${lang}/blog`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Voir page article
                    </a>
                </div>
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
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.03] space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Titre de l'article</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleFieldGenerate('ar', 'TITLE')}
                                        disabled={isGenerating}
                                        className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-black uppercase hover:bg-green-100 disabled:opacity-50 border border-green-100 flex items-center gap-1"
                                    >
                                        {isGenerating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                        AR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFieldGenerate('fr', 'TITLE')}
                                        disabled={isGenerating}
                                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase hover:bg-blue-100 disabled:opacity-50 border border-blue-100 flex items-center gap-1"
                                    >
                                        {isGenerating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                        FR
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-black text-2xl md:text-3xl text-gray-900 placeholder:text-gray-300"
                                placeholder="Titre captivant de l'article..."
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">URL Slug</label>
                                <button
                                    type="button"
                                    onClick={() => handleFieldGenerate('fr', 'SLUG')}
                                    disabled={isGenerating}
                                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase hover:bg-indigo-100 disabled:opacity-50 border border-indigo-100 flex items-center gap-1"
                                >
                                    {isGenerating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                    SEO SLUG
                                </button>
                            </div>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-6 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all font-mono text-sm text-gray-500 placeholder:text-gray-300"
                                placeholder="titre-de-l-article"
                                required
                            />
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Catégorie</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Ex: Développement Personnel"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Mots-clés (tags)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="Ex: productivité, lecture, maroc"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold"
                                />
                                <p className="mt-2 text-[10px] text-gray-400 italic">Séparez les mots-clés par des virgules.</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Extrait / Résumé court</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleFieldGenerate('ar', 'EXCERPT')}
                                        disabled={isGenerating}
                                        className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-black uppercase hover:bg-green-100 disabled:opacity-50 border border-green-100 flex items-center gap-1"
                                    >
                                        {isGenerating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                        AR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFieldGenerate('fr', 'EXCERPT')}
                                        disabled={isGenerating}
                                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase hover:bg-blue-100 disabled:opacity-50 border border-blue-100 flex items-center gap-1"
                                    >
                                        {isGenerating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                        FR
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-medium text-lg text-gray-600 placeholder:text-gray-300 resize-none leading-relaxed"
                                placeholder="Bref résumé accrocheur de l'article..."
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Contenu complet (Markdown)</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleApplyTemplate}
                                    className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-2"
                                >
                                    <BookIcon className="w-3 h-3" />
                                    Template Livre
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFieldGenerate('ar', 'CONTENT')}
                                    disabled={isGenerating}
                                    className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-green-100 transition-colors disabled:opacity-50 border border-green-200 flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Gemini AR
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFieldGenerate('fr', 'CONTENT')}
                                    disabled={isGenerating}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-200 flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Gemini FR
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={25}
                                    className="w-full px-8 py-8 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-black outline-none transition-all font-sans text-[17px] md:text-[19px] text-gray-800 placeholder:text-gray-300 resize-y leading-[2] tracking-wide"
                                    placeholder="# Rédigez votre chef-d'œuvre ici... (Markdown supporté)"
                                    required
                                    style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
                                    Markdown supporté
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/[0.03] space-y-6">
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

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Langue de l'article</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                            >
                                <option value="fr">Français (FR)</option>
                                <option value="ar">العربية (AR)</option>
                                <option value="en">English (EN)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/[0.03] space-y-6">
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

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-black/[0.03] space-y-6">
                        <h3 className="font-bold text-gray-900">Livres liés</h3>
                        <p className="text-[10px] text-gray-500 font-medium">L'article sera affiché sur la page de ces produits.</p>

                        <div className="space-y-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={bookSearch}
                                    onChange={(e) => setBookSearch(e.target.value)}
                                    placeholder="Rechercher un livre..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                            </div>

                            {/* Selected Books */}
                            {selectedBookIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 py-2">
                                    {selectedBookIds.map(id => {
                                        const book = allBooks.find(b => b.id === id)
                                        return (
                                            <div key={id} className="flex items-center gap-2 px-2 py-1 bg-black text-white rounded text-[10px] font-bold">
                                                <span className="truncate max-w-[120px]">{book?.title || 'Livre...'}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBookIds(prev => prev.filter(bid => bid !== id))}
                                                    className="hover:text-red-400"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Book List */}
                            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                                {allBooks
                                    .filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase()) && !selectedBookIds.includes(b.id))
                                    .slice(0, 50)
                                    .map(book => (
                                        <button
                                            key={book.id}
                                            type="button"
                                            onClick={() => setSelectedBookIds(prev => [...prev, book.id])}
                                            className="w-full px-3 py-2 text-left hover:bg-gray-50 text-xs font-medium flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                                {book.image && <img src={book.image.startsWith('http') ? book.image : `data:image/jpeg;base64,${book.image}`} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate font-bold text-gray-900">{book.title}</div>
                                                <div className="truncate text-gray-400">{book.author}</div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
