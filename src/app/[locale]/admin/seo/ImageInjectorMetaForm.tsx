'use client'

import { useState } from 'react'
import { Image as ImageIcon, Search, CheckCircle2, AlertCircle, Loader2, Tag } from 'lucide-react'

interface Book {
    id: string
    title: string
    author: string
    image: string
    altText?: string
    imageTitle?: string
    category?: string
}

interface ImageInjectorMetaFormProps {
    books: Book[]
}

export default function ImageInjectorMetaForm({ books }: ImageInjectorMetaFormProps) {
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState<string | null>(null)
    const [saved, setSaved] = useState<Set<string>>(new Set())
    const [edits, setEdits] = useState<Record<string, { alt: string; title: string }>>(
        Object.fromEntries(books.map(b => [b.id, {
            alt: b.altText || `${b.title} - ${b.author} | Riwaya`,
            title: b.imageTitle || `Acheter ${b.title} de ${b.author} sur Riwaya`
        }]))
    )
    const [message, setMessage] = useState('')

    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    )

    async function saveBook(bookId: string) {
        setSaving(bookId)
        try {
            const res = await fetch(`/api/admin/books/${bookId}/image-seo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(edits[bookId])
            })
            if (res.ok) {
                setSaved(prev => new Set([...prev, bookId]))
                setTimeout(() => setSaved(prev => { const n = new Set(prev); n.delete(bookId); return n }), 2000)
            }
        } catch (e) {
            setMessage('Erreur lors de la sauvegarde.')
        } finally {
            setSaving(null)
        }
    }

    async function saveAll() {
        setSaving('all')
        setMessage('')
        try {
            const res = await fetch('/api/admin/books/image-seo-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ edits })
            })
            if (res.ok) {
                setMessage('Toutes les métadonnées images ont été enregistrées !')
            }
        } catch {
            setMessage('Erreur lors de la sauvegarde.')
        } finally {
            setSaving(null)
        }
    }

    function autoGenerateAll() {
        const updated: Record<string, { alt: string; title: string }> = {}
        books.forEach(b => {
            updated[b.id] = {
                alt: `${b.title} - ${b.author}${b.category ? ` | ${b.category}` : ''} | Librairie Riwaya Maroc`,
                title: `Acheter "${b.title}" de ${b.author} - Livraison rapide au Maroc | Riwaya`
            }
        })
        setEdits(updated)
    }

    return (
        <div className="space-y-6">
            {/* Info box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-blue-800 mb-1">Injection de métadonnées SEO dans les images</p>
                    <p className="text-xs text-blue-700">
                        Le texte <strong>Alt</strong> et le <strong>Title</strong> des images sont indexés par Google Images.
                        Un bon alt text augmente le trafic organique provenant de la recherche d'images.
                    </p>
                </div>
            </div>

            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${message.includes('enregistrées') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.includes('enregistrées') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message}
                </div>
            )}

            {/* Actions globales */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un livre..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={autoGenerateAll}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <Tag className="w-4 h-4" />
                    Auto-générer tout
                </button>
                <button
                    type="button"
                    onClick={saveAll}
                    disabled={saving === 'all'}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {saving === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Sauvegarder tout
                </button>
            </div>

            {/* Liste des livres */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">Aucun livre trouvé.</p>
                )}
                {filtered.map(book => (
                    <div key={book.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                        <div className="flex gap-4 items-start">
                            {/* Image */}
                            <div className="w-16 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                                <img
                                    src={book.image}
                                    alt={edits[book.id]?.alt || book.title}
                                    title={edits[book.id]?.title || book.title}
                                    className="w-full h-full object-cover"
                                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
                                />
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-0.5">{book.title}</p>
                                    <p className="text-xs text-gray-400">{book.author}</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                        Alt Text (indexé par Google Images)
                                    </label>
                                    <input
                                        type="text"
                                        value={edits[book.id]?.alt || ''}
                                        onChange={e => setEdits(prev => ({ ...prev, [book.id]: { ...prev[book.id], alt: e.target.value } }))}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        placeholder={`${book.title} - ${book.author} | Riwaya`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                        Title (tooltip + SEO)
                                    </label>
                                    <input
                                        type="text"
                                        value={edits[book.id]?.title || ''}
                                        onChange={e => setEdits(prev => ({ ...prev, [book.id]: { ...prev[book.id], title: e.target.value } }))}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        placeholder={`Acheter ${book.title} | Riwaya`}
                                    />
                                </div>
                            </div>

                            {/* Save individual */}
                            <button
                                type="button"
                                onClick={() => saveBook(book.id)}
                                disabled={saving === book.id}
                                className="shrink-0 flex items-center gap-1 px-4 py-2 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 mt-8"
                            >
                                {saving === book.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : saved.has(book.id) ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                ) : null}
                                {saved.has(book.id) ? 'Sauvé' : 'Sauver'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
