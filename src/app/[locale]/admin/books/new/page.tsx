'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createBook, fetchAllAuthors, type BookInput } from '@/lib/actions/books'
import { getPurchaseLots } from '@/lib/actions/finance'
import ImageInput from '@/components/admin/ImageInput'

export default function BookForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lots, setLots] = useState<any[]>([])
    const [selectedCost, setSelectedCost] = useState<string>('0')
    const [authors, setAuthors] = useState<string[]>([])
    const [selectedAuthor, setSelectedAuthor] = useState<string>('')
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false)
    const authorInputRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getPurchaseLots().then(data => {
            setLots(data)
        })
        fetchAllAuthors().then(res => {
            if (res.success && res.data) setAuthors(res.data)
        })
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (authorInputRef.current && !authorInputRef.current.contains(event.target as Node)) {
                setIsAuthorDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredAuthors = authors.filter(a => a.toLowerCase().includes(selectedAuthor.toLowerCase()))

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        // Gérer l'image (URL ou fichier uploadé)
        let imageUrl = formData.get('image') as string
        const imageFile = formData.get('imageFile') as File

        // Si un fichier est uploadé, le sauvegarder
        if (imageFile && imageFile.size > 0) {
            try {
                const uploadFormData = new FormData()
                uploadFormData.append('file', imageFile)

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData
                })

                if (!uploadResponse.ok) {
                    throw new Error('Erreur lors de l\'upload de l\'image')
                }

                const uploadResult = await uploadResponse.json()
                imageUrl = uploadResult.url
            } catch (err) {
                setError('Erreur lors de l\'upload de l\'image')
                setLoading(false)
                return
            }
        }

        const input: BookInput = {
            title: formData.get('title') as string,
            author: formData.get('author') as string,
            description: formData.get('description') as string,
            isbn: formData.get('isbn') as string || undefined,
            price: parseFloat(formData.get('price') as string),
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            stock: parseInt(formData.get('stock') as string),
            image: imageUrl,
            category: formData.get('category') as string || undefined,
            language: formData.get('language') as string || 'fr',
            previewUrl: formData.get('previewUrl') as string || undefined,
            isOriginal: formData.get('isOriginal') !== 'false', // Par défaut true
        }

        const result = await createBook(input)

        if (result.success) {
            router.push('/admin/books')
            router.refresh()
        } else {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/books"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Ajouter un livre</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Remplissez les informations du nouveau livre
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titre */}
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Titre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Atomic Habits"
                        />
                    </div>

                    {/* Auteur */}
                    <div className="relative" ref={authorInputRef}>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                            Auteur <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="author"
                            name="author"
                            required
                            value={selectedAuthor}
                            onChange={(e) => {
                                setSelectedAuthor(e.target.value);
                                setIsAuthorDropdownOpen(true);
                            }}
                            onFocus={() => setIsAuthorDropdownOpen(true)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Sélectionner ou saisir un auteur..."
                            autoComplete="off"
                        />
                        
                        {isAuthorDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {filteredAuthors.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredAuthors.map((author) => (
                                            <li
                                                key={author}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                                                onClick={() => {
                                                    setSelectedAuthor(author);
                                                    setIsAuthorDropdownOpen(false);
                                                }}
                                            >
                                                {author}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">
                                        {selectedAuthor ? (
                                            <span>
                                                Nouvel auteur: <span className="font-bold text-blue-600">{selectedAuthor}</span> sera créé
                                            </span>
                                        ) : (
                                            "Aucun auteur trouvé"
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Saisissez pour chercher ou ajouter un nouvel auteur.</p>
                    </div>

                    {/* ISBN */}
                    <div>
                        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                            ISBN
                        </label>
                        <input
                            type="text"
                            id="isbn"
                            name="isbn"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 9780735211292"
                        />
                    </div>

                    {/* Prix */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Prix de Vente (MAD) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="150"
                        />
                    </div>

                    {/* Coût de revient (Pour Marge) */}
                    <div className="md:col-span-2 bg-orange-50 border border-orange-200 p-4 rounded-xl">
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                            Coût de revient / Achat (Sert à calculer la marge finale !!)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Associer depuis un Lot d'Achats</label>
                                <select 
                                    className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) => {
                                        if (e.target.value) setSelectedCost(e.target.value)
                                    }}
                                >
                                    <option value="0">-- Choisir un lot ou saisir manuellement --</option>
                                    {lots.map(lot => (
                                        <option key={lot.id} value={lot.unitCost || 0}>
                                            {lot.title} ({new Date(lot.date).toLocaleDateString('fr-FR')}) {lot.unitCost ? `- ${lot.unitCost} MAD/livre` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="costPrice" className="block text-xs font-bold text-gray-600 mb-1">
                                    Coût unitaire appliqué (MAD)
                                </label>
                                <input
                                    type="number"
                                    id="costPrice"
                                    name="costPrice"
                                    min="0"
                                    step="0.01"
                                    value={selectedCost}
                                    onChange={(e) => setSelectedCost(e.target.value)}
                                    className="w-full px-4 py-2 border border-orange-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 font-black text-orange-700"
                                    placeholder="Ex: 50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock */}
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                            Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="50"
                        />
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Catégorie
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Sélectionner une catégorie</option>
                            <option value="Développement personnel">Développement personnel</option>
                            <option value="Business">Business</option>
                            <option value="Productivité">Productivité</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Finance">Finance</option>
                            <option value="Psychologie">Psychologie</option>
                            <option value="Histoire">Histoire</option>
                            <option value="Stratégie">Stratégie</option>
                            <option value="Roman">Roman</option>
                            <option value="Science-Fiction">Science-Fiction</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Thriller / Policier">Thriller / Policier</option>
                            <option value="Manga">Manga</option>
                            <option value="Bande dessinée">Bande dessinée</option>
                            <option value="Biographie">Biographie</option>
                            <option value="Santé & Bien-être">Santé & Bien-être</option>
                            <option value="Cuisine">Cuisine</option>
                            <option value="Informatique & Tech">Informatique & Tech</option>
                            <option value="Religion & Spiritualité">Religion & Spiritualité</option>
                            <option value="Philosophie">Philosophie</option>
                            <option value="Art & Photographie">Art & Photographie</option>
                            <option value="Enfants & Jeunesse">Enfants & Jeunesse</option>
                        </select>
                    </div>

                    {/* Langue du Livre */}
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                            Langue du Livre
                        </label>
                        <select
                            id="language"
                            name="language"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="fr">Français</option>
                            <option value="ar">Arabe</option>
                            <option value="en">Anglais</option>
                        </select>
                    </div>

                    {/* Livre Original */}
                    <div>
                        <label htmlFor="isOriginal" className="block text-sm font-medium text-gray-700 mb-2">
                            Type de Livre
                        </label>
                        <select
                            id="isOriginal"
                            name="isOriginal"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                            <option value="true" className="text-green-600 font-medium">✅ Livre Original</option>
                            <option value="false" className="text-red-600 font-medium">❌ Copie / Reproduction</option>
                        </select>
                    </div>

                    {/* Image */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image <span className="text-red-500">*</span>
                        </label>
                        <ImageInput />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Description détaillée du livre..."
                        />
                    </div>

                    {/* Extrait de Lecture (previewUrl) */}
                    <div className="md:col-span-2">
                        <label htmlFor="previewUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            Lien d'extrait (PDF / Google Drive) - Optionnel
                        </label>
                        <input
                            type="url"
                            id="previewUrl"
                            name="previewUrl"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: https://lien-vers-mon-pdf.com"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-4">
                    <Link
                        href="/admin/books"
                        className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    )
}
