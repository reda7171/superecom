'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  title: string
  author: string
  price: number
  originalPrice?: number | null
  category?: string | null
  language: string
  active: boolean
  featured: boolean
  downloadCount: number
  createdAt: Date
}

export default function DigitalProductsTable({
  products,
  pageNumber,
  totalPages,
  initialSearch,
}: {
  products: Product[]
  pageNumber: number
  totalPages: number
  initialSearch: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState<string | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/admin/digital-products?search=${encodeURIComponent(search)}`)
  }

  async function handleToggle(id: string, field: 'active' | 'featured', value: boolean) {
    setLoading(id)
    try {
      await fetch(`/api/admin/digital-products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !value }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit numérique ?')) return
    setLoading(id)
    try {
      await fetch(`/api/admin/digital-products/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Recherche */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher titre, auteur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre / Auteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actif
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vedette
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DL
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  Aucun produit numérique trouvé
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${loading === p.id ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-500 italic">{p.author}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{p.price} MAD</p>
                      {p.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">{p.originalPrice} MAD</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      {p.category || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(p.id, 'active', p.active)}
                      className={`p-1.5 rounded-full transition-colors ${
                        p.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(p.id, 'featured', p.featured)}
                      className={`p-1.5 rounded-full transition-colors ${
                        p.featured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-blue-600">{p.downloadCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/digital-products/${p.id}/edit`}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Page {pageNumber} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {pageNumber > 1 && (
              <Link
                href={`/admin/digital-products?page=${pageNumber - 1}&search=${initialSearch}`}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
            {pageNumber < totalPages && (
              <Link
                href={`/admin/digital-products?page=${pageNumber + 1}&search=${initialSearch}`}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
