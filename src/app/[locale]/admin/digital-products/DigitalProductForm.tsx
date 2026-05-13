'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Upload, FileCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id?: string
  title?: string
  author?: string
  description?: string
  price?: number
  originalPrice?: number | null
  image?: string
  pdfUrl?: string
  category?: string | null
  language?: string
  pages?: number | null
  fileSize?: string | null
  active?: boolean
  featured?: boolean
}

export default function DigitalProductForm({ product }: { product?: Product } = {}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: product?.title || '',
    author: product?.author || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    image: product?.image || '',
    pdfUrl: product?.pdfUrl || '',
    category: product?.category || '',
    language: product?.language || 'fr',
    pages: product?.pages?.toString() || '',
    fileSize: product?.fileSize || '',
    active: product?.active !== false,
    featured: product?.featured || false,
  })

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'upload')

      setForm((prev) => ({
        ...prev,
        pdfUrl: data.url,
        fileSize: `${(data.size / (1024 * 1024)).toFixed(2)} MB`,
      }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body = {
      title: form.title,
      author: form.author,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      image: form.image,
      pdfUrl: form.pdfUrl,
      category: form.category || null,
      language: form.language,
      pages: form.pages ? parseInt(form.pages) : null,
      fileSize: form.fileSize || null,
      active: form.active,
      featured: form.featured,
    }

    try {
      const url = product?.id
        ? `/api/admin/digital-products/${product.id}`
        : '/api/admin/digital-products'
      const method = product?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur serveur')
      }

      router.push('/admin/digital-products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const INPUT_CLASS = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow'
  const LABEL_CLASS = 'block text-sm font-semibold text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Infos de base */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Informations du livre</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL_CLASS}>Titre *</label>
            <input
              required
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Atomic Habits"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Auteur *</label>
            <input
              required
              value={form.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="Ex: James Clear"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description du livre..."
            className={INPUT_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={LABEL_CLASS}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Sélectionner...</option>
              <option value="Développement Personnel">Développement Personnel</option>
              <option value="Business & Finance">Business & Finance</option>
              <option value="Psychologie">Psychologie</option>
              <option value="Romans & Fiction">Romans & Fiction</option>
              <option value="Religion">Religion</option>
              <option value="Philosophie">Philosophie</option>
              <option value="Productivité">Productivité</option>
              <option value="Enfants">Enfants</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Langue</label>
            <select
              value={form.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="fr">Français</option>
              <option value="ar">Arabe</option>
              <option value="en">Anglais</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Nombre de pages</label>
            <input
              type="number"
              value={form.pages}
              onChange={(e) => handleChange('pages', e.target.value)}
              placeholder="Ex: 320"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      {/* Prix */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Prix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL_CLASS}>Prix (MAD) *</label>
            <input
              required
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="Ex: 49"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Prix original (MAD) — pour afficher la réduction</label>
            <input
              type="number"
              step="0.01"
              value={form.originalPrice}
              onChange={(e) => handleChange('originalPrice', e.target.value)}
              placeholder="Ex: 79"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      {/* Fichiers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Fichiers & Médias</h2>

        <div>
          <label className={LABEL_CLASS}>URL de l'image de couverture *</label>
          <input
            required
            value={form.image}
            onChange={(e) => handleChange('image', e.target.value)}
            placeholder="https://... ou /uploads/..."
            className={INPUT_CLASS}
          />
          <p className="text-xs text-gray-500 mt-1">URL de l'image de couverture du livre</p>
        </div>

        <div>
          <label className={LABEL_CLASS}>Fichier PDF *</label>
          <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
            form.pdfUrl ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-amber-300'
          }`}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <div className="flex flex-col items-center justify-center text-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-sm font-bold text-gray-700">Upload en cours...</p>
                </>
              ) : form.pdfUrl ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-700">PDF prêt !</p>
                    <p className="text-xs text-green-600 truncate max-w-[250px]">{form.pdfUrl}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleChange('pdfUrl', '')}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Supprimer et changer
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Cliquez ou glissez un PDF</p>
                    <p className="text-xs text-gray-500">Max 50 MB</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <input type="hidden" value={form.pdfUrl} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className={LABEL_CLASS}>URL directe (Optionnel)</label>
            <input
              value={form.pdfUrl}
              onChange={(e) => handleChange('pdfUrl', e.target.value)}
              placeholder="https://..."
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Taille du fichier (Auto)</label>
            <input
              readOnly
              value={form.fileSize}
              placeholder="Ex: 2.4 MB"
              className={`${INPUT_CLASS} bg-gray-50`}
            />
          </div>
        </div>
      </div>

      {/* Visibilité */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Visibilité</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">Produit actif (visible sur le site)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Mettre en vedette</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Enregistrement...' : product?.id ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        <Link
          href="/admin/digital-products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </Link>
      </div>
    </form>
  )
}
