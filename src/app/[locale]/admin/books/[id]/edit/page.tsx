'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { getBookById, updateBook, fetchAllAuthors, type BookInput } from '@/lib/actions/books'
import { getPurchaseLots } from '@/lib/actions/finance'
import ImageInput from '@/components/admin/ImageInput'

export default function EditBookPage({ params, searchParams }: { params: Promise<{ id: string, locale: string }>, searchParams: Promise<{ page?: string, search?: string, filter?: string }> }) {
    const router = useRouter()
    const resolvedParams = use(params)
    const resolvedSearchParams = use(searchParams)
    const bookId = resolvedParams.id
    
    // Construction de l'URL de retour
    const returnUrlParams = new URLSearchParams()
    if (resolvedSearchParams.page) returnUrlParams.set('page', resolvedSearchParams.page)
    if (resolvedSearchParams.search) returnUrlParams.set('search', resolvedSearchParams.search)
    if (resolvedSearchParams.filter) returnUrlParams.set('filter', resolvedSearchParams.filter)
    const returnUrl = `/admin/books${returnUrlParams.toString() ? `?${returnUrlParams.toString()}` : ''}`

    const [id, setId] = useState<string>(bookId)
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [book, setBook] = useState<any>(null)
    const [lots, setLots] = useState<any[]>([])
    const [selectedCost, setSelectedCost] = useState<string>('0')
    
    // Nouveaux states pour les champs gérés avec Gemini
    const [description, setDescription] = useState<string>('')
    const [longDescription, setLongDescription] = useState<string>('')
    const [isGeneratingShort, setIsGeneratingShort] = useState(false)
    const [isGeneratingLong, setIsGeneratingLong] = useState(false)
    const [authors, setAuthors] = useState<string[]>([])
    const [isNewAuthor, setIsNewAuthor] = useState(false)
    const [selectedAuthor, setSelectedAuthor] = useState<string>('')

    useEffect(() => {
        getPurchaseLots().then(data => setLots(data))
        fetchAllAuthors().then(res => {
            if (res.success && res.data) setAuthors(res.data)
        })
    }, [])

    useEffect(() => {
        if (bookId) {
            loadBook(bookId)
        }
    }, [bookId])

    async function loadBook(bookId: string) {
        setLoadingData(true)
        const result = await getBookById(bookId)

        if (result.success && result.data) {
            setBook(result.data)
            setSelectedCost((result.data as any).costPrice?.toString() || '0')
            setDescription(result.data.description || '')
            setLongDescription(result.data.longDescription || '')
            setSelectedAuthor(result.data.author || '')
        } else {
            setError(result.error || 'Livre introuvable')
        }
        setLoadingData(false)
    }

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
            longDescription: formData.get('longDescription') as string || undefined,
            isbn: formData.get('isbn') as string || undefined,
            price: parseFloat(formData.get('price') as string),
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            stock: parseInt(formData.get('stock') as string),
            image: imageUrl,
            category: formData.get('category') as string || undefined,
            language: formData.get('language') as string || 'fr',
            active: formData.get('active') === 'true',
            status: formData.get('status') as string || 'APPROVED',
            isBestSeller: formData.get('isBestSeller') === 'true',
            previewUrl: formData.get('previewUrl') as string || undefined,
            isOriginal: formData.get('isOriginal') !== 'false',
        }

        const result = await updateBook(id, input)

        if (result.success) {
            router.push(returnUrl)
            router.refresh()
        } else {
            setError(result.error)
            setLoading(false)
        }
    }

    const generateShortDescription = async () => {
        // Use the current input values if available
        const titleInput = (document.getElementById('title') as HTMLInputElement)?.value || book?.title;
        const authorInput = (document.getElementById('author') as HTMLInputElement)?.value || book?.author;
        
        if (!titleInput) return;
        setIsGeneratingShort(true);
        try {
            const authorText = authorInput ? ` écrit par ${authorInput}` : '';
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `Rédige une courte description accrocheuse (2 à 3 phrases) pour le livre intitulé "${titleInput}"${authorText} en français. N'inclus pas d'introduction.` })
            });
            const data = await res.json();
            if (data.text) setDescription(data.text.trim());
        } catch (err) {
            console.error(err);
        }
        setIsGeneratingShort(false);
    }

    const generateLongDescription = async () => {
        const titleInput = (document.getElementById('title') as HTMLInputElement)?.value || book?.title;
        const authorInput = (document.getElementById('author') as HTMLInputElement)?.value || book?.author;

        if (!titleInput) return;
        setIsGeneratingLong(true);
        try {
            const authorText = authorInput ? ` écrit par ${authorInput}` : '';
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `Rédige une description complète et détaillée pour le livre "${titleInput}"${authorText} en français. Inclus un résumé, les thèmes abordés et pourquoi le lire. Utilise des paragraphes. N'inclus pas d'introduction du style "Voici la description".` })
            });
            const data = await res.json();
            if (data.text) setLongDescription(data.text.trim());
        } catch (err) {
            console.error(err);
        }
        setIsGeneratingLong(false);
    }

    if (loadingData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-gray-500">Chargement...</div>
            </div>
        )
    }

    if (!book) {
        return (
            <div>
                <div className="mb-8">
                    <Link
                        href={returnUrl}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la liste
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Livre introuvable</h1>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error || 'Ce livre n\'existe pas'}</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={returnUrl}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Modifier le livre</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Modifiez les informations du livre "{book.title}"
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Form */}
            <form key={book.id} onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
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
                            defaultValue={book.title}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Atomic Habits"
                        />
                    </div>

                    {/* Auteur */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                                Auteur <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsNewAuthor(!isNewAuthor)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                            >
                                {isNewAuthor ? "Choisir existant" : "+ Nouvel auteur"}
                            </button>
                        </div>
                        {isNewAuthor ? (
                            <input
                                type="text"
                                id="author"
                                name="author"
                                required
                                defaultValue={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Saisir le nom du nouvel auteur"
                            />
                        ) : (
                            <select
                                id="author"
                                name="author"
                                required
                                value={selectedAuthor}
                                onChange={(e) => {
                                    if (e.target.value === 'NEW') {
                                        setIsNewAuthor(true);
                                        setSelectedAuthor('');
                                    } else {
                                        setSelectedAuthor(e.target.value);
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="" disabled>Sélectionner un auteur</option>
                                {authors.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                                {/* Assurer que l'auteur actuel est dans la liste s'il a été supprimé des autres livres */}
                                {selectedAuthor && !authors.includes(selectedAuthor) && selectedAuthor !== 'NEW' && (
                                    <option value={selectedAuthor}>{selectedAuthor}</option>
                                )}
                                <option value="NEW" className="font-bold text-blue-600">+ Ajouter un nouvel auteur...</option>
                            </select>
                        )}
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
                            defaultValue={book.isbn || ''}
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
                            defaultValue={book.price}
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
                            defaultValue={book.stock}
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
                            defaultValue={book.category || ''}
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
                            defaultValue={book.language || 'fr'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="fr">Français</option>
                            <option value="ar">Arabe</option>
                            <option value="en">Anglais</option>
                        </select>
                    </div>

                    {/* Visibilité (Actif/Inactif) */}
                    <div>
                        <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-2">
                            Visibilité Publique
                        </label>
                        <select
                            id="active"
                            name="active"
                            defaultValue={book.active ? 'true' : 'false'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                            <option value="true" className="text-green-600 font-medium">✅ Actif (Visible sur le site)</option>
                            <option value="false" className="text-gray-500 font-medium">❌ Inactif (Masqué)</option>
                        </select>
                    </div>

                    {/* Statut Administratif */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                            Statut Administratif
                        </label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={book.status || 'APPROVED'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="APPROVED">Approuvé (APPROVED)</option>
                            <option value="PENDING">En attente d'approbation (PENDING)</option>
                            <option value="REJECTED">Rejeté (REJECTED)</option>
                        </select>
                    </div>

                    {/* Meilleure Vente */}
                    <div>
                        <label htmlFor="isBestSeller" className="block text-sm font-medium text-gray-700 mb-2">
                            Mettre en "Meilleure Vente"
                        </label>
                        <select
                            id="isBestSeller"
                            name="isBestSeller"
                            defaultValue={book.isBestSeller ? 'true' : 'false'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                            <option value="false" className="text-gray-500 font-medium">Non</option>
                            <option value="true" className="text-orange-600 font-medium">⭐ Oui (Meilleure Vente)</option>
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
                            defaultValue={book.isOriginal ? 'true' : 'false'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                            <option value="true" className="text-green-600 font-medium">✅ Livre Original</option>
                            <option value="false" className="text-red-600 font-medium">❌ Copie / Reproduction</option>
                        </select>
                    </div>

                    {/* Image URL ou Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image <span className="text-red-500">*</span>
                        </label>
                        <ImageInput defaultValue={book.image} bookTitle={book.title} />
                    </div>

                    {/* Description courte */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description courte <span className="text-red-500">*</span>
                            </label>
                            <button type="button" onClick={generateShortDescription} disabled={isGeneratingShort} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1 transition-all bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                                {isGeneratingShort ? <Loader2 className="w-4 h-4 animate-spin"/> : '✨ GEMINI'}
                            </button>
                        </div>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Description courte du livre..."
                        />
                    </div>

                    {/* Description longue */}
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">
                                Description longue
                                <span className="ml-2 text-xs text-gray-400 font-normal">(optionnel — affichée sur la page du livre)</span>
                            </label>
                            <button type="button" onClick={generateLongDescription} disabled={isGeneratingLong} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1 transition-all bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                                {isGeneratingLong ? <Loader2 className="w-4 h-4 animate-spin"/> : '✨ GEMINI'}
                            </button>
                        </div>
                        <textarea
                            id="longDescription"
                            name="longDescription"
                            rows={8}
                            value={longDescription}
                            onChange={(e) => setLongDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Description détaillée, biographie de l'auteur, contexte du livre..."
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
                            defaultValue={book.previewUrl || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: https://lien-vers-mon-pdf.com"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-4">
                    <Link
                        href={returnUrl}
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
