'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Edit, Trash2, Eye, EyeOff, Search, Check, X, Edit3, ImageIcon, FileDown, GripVertical, LayoutGrid, List } from 'lucide-react'
import { deleteBook, toggleBookStatus, bulkDeleteBooks, updateBookQuick, updateBookOrder, bulkUpdateBookPrices } from '@/lib/actions/books'
import { useRouter, usePathname } from 'next/navigation'
import ImageWithFallback from '@/components/ImageWithFallback'
import BookCreativeModal from '@/components/admin/BookCreativeModal'
import BookDescriptionModal from '@/components/admin/BookDescriptionModal'
import N8nPublishModal from '@/components/admin/N8nPublishModal'
import { normalizeImage } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface Book {
    id: string
    title: string
    author: string
    price: number
    stock: number
    image: string
    category: string | null
    language: string
    description: string
    longDescription?: string | null
    active: boolean
    isOriginal: boolean
}

export default function BooksTable({ books, pageNumber, totalProviderPages, initialSearch, initialFilter = '', limit = 20 }: { books: Book[], pageNumber: number, totalProviderPages: number, initialSearch: string, initialFilter?: string, limit?: number }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkLoading, setBulkLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState({ price: 0, stock: 0, active: true })
    const [creativeBook, setCreativeBook] = useState<Book | null>(null)
    const [creativeFormat, setCreativeFormat] = useState<'post' | 'story'>('post')
    const [descriptionBook, setDescriptionBook] = useState<Book | null>(null)
    const [descriptionFormat, setDescriptionFormat] = useState<'post' | 'story'>('post')
    const [n8nBook, setN8nBook] = useState<Book | null>(null)
    const [n8nFormat, setN8nFormat] = useState<'post' | 'story'>('post')
    const [quickPublishing, setQuickPublishing] = useState<string | null>(null)
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
    const [orderedBooks, setOrderedBooks] = useState(books)
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
    const [bulkPrice, setBulkPrice] = useState<string>('')
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        setOrderedBooks(books)
    }, [books])

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return
        if (result.destination.index === result.source.index) return

        const items = Array.from(orderedBooks)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setOrderedBooks(items)

        const offset = (pageNumber - 1) * limit
        const res = await updateBookOrder(items.map(b => b.id), offset)
        if (!res.success) {
            alert(res.error)
            setOrderedBooks(books)
        } else {
            setToast({ msg: 'Ordre mis à jour', ok: true })
            router.refresh()
            setTimeout(() => setToast(null), 2000)
        }
    }

    const handleQuickEdit = (book: Book) => {
        setEditingId(book.id)
        setEditData({ price: book.price, stock: book.stock, active: book.active })
    }

    // Publication immédiate sans modal
    const handleQuickPublish = async (book: Book) => {
        setQuickPublishing(book.id)
        try {
            const res = await fetch('/api/n8n/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: book.id,
                    format: 'post',
                    platform: 'both',
                    useDescription: 'short',
                    scheduleAt: null
                })
            })
            const data = await res.json()
            if (data.success) {
                setToast({ msg: `✅ "${book.title}" envoyé à n8n pour publication`, ok: true })
                setTimeout(() => setToast(null), 4000)
            } else {
                setToast({ msg: `❌ ${data.error || 'Erreur n8n'}`, ok: false })
                setTimeout(() => setToast(null), 5000)
            }
        } catch {
            setToast({ msg: '❌ Erreur réseau — vérifiez que n8n tourne', ok: false })
            setTimeout(() => setToast(null), 5000)
        } finally {
            setQuickPublishing(null)
        }
    }

    const saveQuickEdit = async () => {
        if (!editingId) return
        setLoading(editingId)
        const result = await updateBookQuick(editingId, editData)
        setLoading(null)
        if (result.success) {
            setEditingId(null)
        } else {
            alert(result.error)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        // Removed - handled by BookFilters
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(books.map(b => b.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} livre(s) ?`)) return

        setBulkLoading(true)
        const result = await bulkDeleteBooks(selectedIds)
        setBulkLoading(false)

        if (result.success) {
            setSelectedIds([])
        } else {
            alert(result.error)
        }
    }

    const handleBulkPriceUpdate = async () => {
        if (selectedIds.length === 0 || !bulkPrice) return
        const price = Number(bulkPrice)
        if (isNaN(price)) return alert('Prix invalide')
        
        if (!confirm(`Êtes-vous sûr de vouloir changer le prix de ${selectedIds.length} livre(s) à ${price} MAD ?`)) return

        setIsUpdatingPrice(true)
        const result = await bulkUpdateBookPrices(selectedIds, price)
        setIsUpdatingPrice(false)

        if (result.success) {
            setBulkPrice('')
            setSelectedIds([])
            setToast({ msg: `✅ Prix mis à jour pour ${selectedIds.length} livres`, ok: true })
            setTimeout(() => setToast(null), 4000)
        } else {
            alert(result.error)
        }
    }

    // Export Excel de tous les livres
    const handleExportExcel = async () => {
        try {
            const res = await fetch('/api/admin/books/export-excel')
            if (!res.ok) throw new Error('Export échoué')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `livres_export_${new Date().toISOString().split('T')[0]}.xlsx`
            a.click()
            URL.revokeObjectURL(url)
            setToast({ msg: 'Export Excel téléchargé', ok: true })
            setTimeout(() => setToast(null), 4000)
        } catch {
            setToast({ msg: 'Erreur lors de l\'export Excel', ok: false })
            setTimeout(() => setToast(null), 5000)
        }
    }

    // Export Excel Jumia pour les livres sélectionnés
    const handleExportJumia = async () => {
        if (selectedIds.length === 0) return
        try {
            const res = await fetch('/api/admin/books/export-jumia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            })
            if (!res.ok) throw new Error('Export échoué')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `jumia_export_${new Date().toISOString().split('T')[0]}.xlsx`
            a.click()
            URL.revokeObjectURL(url)
            setToast({ msg: `✅ Export Jumia : ${selectedIds.length} livre(s) exporté(s)`, ok: true })
            setTimeout(() => setToast(null), 4000)
        } catch {
            setToast({ msg: '❌ Erreur lors de l\'export Jumia', ok: false })
            setTimeout(() => setToast(null), 5000)
        }
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
            return
        }

        setLoading(id)
        const result = await deleteBook(id)
        setLoading(null)

        if (!result.success) {
            alert(result.error)
        }
    }

    async function handleToggleStatus(id: string, currentStatus: boolean) {
        setLoading(id)
        const result = await toggleBookStatus(id, !currentStatus)
        setLoading(null)

        if (!result.success) {
            alert(result.error)
        }
    }

    const buildUrl = (page: number, newLimit?: number) => {
        const params = new URLSearchParams()
        if (initialSearch.trim()) params.set('search', initialSearch.trim())
        if (initialFilter) params.set('filter', initialFilter)
        if (newLimit || limit !== 20) params.set('limit', (newLimit || limit).toString())
        params.set('page', page.toString())
        return `${pathname}?${params.toString()}`
    }

    const renderPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, pageNumber - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalProviderPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => router.push(buildUrl(1))} className={`px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors`}>1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="dots1" className="px-2 text-gray-500">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => router.push(buildUrl(i))}
                    className={`px-3 py-1 border border-gray-300 rounded text-sm transition-colors ${pageNumber === i ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'hover:bg-gray-50'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalProviderPages) {
            if (endPage < totalProviderPages - 1) {
                pages.push(<span key="dots2" className="px-2 text-gray-500">...</span>);
            }
            pages.push(
                <button key={totalProviderPages} onClick={() => router.push(buildUrl(totalProviderPages))} className={`px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors`}>{totalProviderPages}</button>
            );
        }

        return pages;
    };

    return (
        <div className="space-y-4">
            {/* Toast notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all animate-in slide-in-from-top-2 ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Total: <span className="text-gray-900 font-black">{books.length}</span> livres affichés
                    </p>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`} title="Vue Liste"><List className="w-4 h-4"/></button>
                        <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`} title="Vue Kanban"><LayoutGrid className="w-4 h-4"/></button>
                    </div>
                    <select
                        value={limit}
                        onChange={(e) => router.push(buildUrl(1, Number(e.target.value)))}
                        className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="20">20 / page</option>
                        <option value="50">50 / page</option>
                        <option value="100">100 / page</option>
                        <option value="10000">Toutes</option>
                    </select>
                </div>
                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition shadow-sm"
                    title="Exporter tous les livres en Excel"
                >
                    <FileDown className="w-4 h-4" />
                    Export Excel
                </button>
            </div>

            {books.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Aucun livre trouvé {initialSearch && `pour "${initialSearch}"`}</p>
                </div>
            ) : (
                <>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mx-4 mt-4 flex-wrap">
                            <span className="text-sm font-black text-gray-900">{selectedIds.length} livre(s) sélectionnés</span>
                            
                            <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Nouveau prix..."
                                    value={bulkPrice}
                                    onChange={(e) => setBulkPrice(e.target.value)}
                                    className="w-32 px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleBulkPriceUpdate}
                                    disabled={isUpdatingPrice || !bulkPrice}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {isUpdatingPrice ? 'Mise à jour...' : 'Changer Prix'}
                                </button>
                            </div>

                            <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>

                            {/* Bouton export Jumia */}
                            <button
                                onClick={handleExportJumia}
                                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition"
                                title="Exporter au format Excel Jumia Vendor"
                            >
                                <FileDown className="w-4 h-4" />
                                Export Jumia
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkLoading}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                {bulkLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    )}
                    <div className={`overflow-x-auto ${viewMode === 'kanban' ? 'hidden' : ''}`}>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 w-10 text-left">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={books.length > 0 && selectedIds.length === books.length}
                                                className="rounded border-gray-300 text-black focus:ring-black"
                                            />
                                        </th>
                                        <th className="px-4 py-3 w-8"></th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Livre
                                        </th>
                                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Catégorie
                                        </th>
                                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Langue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <Droppable droppableId="books-list">
                                    {(provided) => (
                                        <tbody 
                                            {...provided.droppableProps} 
                                            ref={provided.innerRef}
                                            className="bg-white divide-y divide-gray-200"
                                        >
                                            {orderedBooks.map((book, index) => (
                                                <Draggable key={book.id} draggableId={book.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <tr 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`transition-colors ${snapshot.isDragging ? 'bg-blue-50 shadow-lg' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(book.id)}
                                                                    onChange={() => handleSelectOne(book.id)}
                                                                    className="rounded border-gray-300 text-black focus:ring-black"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" {...provided.dragHandleProps}>
                                                                <GripVertical className="w-5 h-5" />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-12 w-10 flex-shrink-0">
                                                                        <img
                                                                            src={normalizeImage(book.image)}
                                                                            alt={book.title}
                                                                            className="w-full h-full object-cover rounded"
                                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/book-placeholder.png' }}
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {book.title}
                                                                            <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded-md border ${book.isOriginal ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                                                {book.isOriginal ? 'Original' : 'Copie'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">{book.author}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                    {book.category || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 uppercase">
                                                                    {book.language}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {editingId === book.id ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editData.price}
                                                                        onChange={e => setEditData({ ...editData, price: Number(e.target.value) })}
                                                                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                ) : (
                                                                    <>{book.price} MAD</>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {editingId === book.id ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editData.stock}
                                                                        onChange={e => setEditData({ ...editData, stock: Number(e.target.value) })}
                                                                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                ) : (
                                                                    <span className={`text-sm font-medium ${book.stock > 10 ? 'text-green-600' : book.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                                                        {book.stock} unités
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {editingId === book.id ? (
                                                                    <select
                                                                        value={editData.active ? 'true' : 'false'}
                                                                        onChange={e => setEditData({ ...editData, active: e.target.value === 'true' })}
                                                                        className={`text-xs px-2 py-1 rounded border outline-none font-medium ${editData.active ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-400 text-gray-700 bg-gray-50'}`}
                                                                    >
                                                                        <option value="true">✅ Actif</option>
                                                                        <option value="false">❌ Inactif</option>
                                                                    </select>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleToggleStatus(book.id, book.active)}
                                                                        disabled={loading === book.id}
                                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${book.active
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                                            } hover:opacity-80 transition-opacity`}
                                                                    >
                                                                        {book.active ? (
                                                                            <>
                                                                                <Eye className="w-3 h-3 mr-1" />
                                                                                Actif
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <EyeOff className="w-3 h-3 mr-1" />
                                                                                Inactif
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {editingId === book.id ? (
                                                                        <>
                                                                            <button
                                                                                onClick={saveQuickEdit}
                                                                                disabled={loading === book.id}
                                                                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                                                                title="Enregistrer"
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingId(null)}
                                                                                className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition-colors"
                                                                                title="Annuler"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Link
                                                                                href={`/books/${book.id}`}
                                                                                target="_blank"
                                                                                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded transition-colors"
                                                                                title="Voir sur le site"
                                                                            >
                                                                                <Eye className="w-4 h-4" />
                                                                            </Link>
                                                                            <button
                                                                                onClick={() => { setCreativeFormat('post'); setCreativeBook(book); }}
                                                                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded transition-colors"
                                                                                title="Générer un Post (FB/Insta)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setCreativeFormat('story'); setCreativeBook(book); }}
                                                                                className="text-pink-600 hover:text-pink-900 p-2 hover:bg-pink-50 rounded transition-colors"
                                                                                title="Générer une Story (FB/Insta)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setDescriptionFormat('post'); setDescriptionBook(book); }}
                                                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                                                title="Générer Description (Post)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setDescriptionFormat('story'); setDescriptionBook(book); }}
                                                                                className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition-colors"
                                                                                title="Générer Description (Story)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setDescriptionFormat('post'); setDescriptionBook({...book, description: book.longDescription || book.description}); }}
                                                                                className="text-cyan-600 hover:text-cyan-900 p-2 hover:bg-cyan-50 rounded transition-colors"
                                                                                title="Générer Description Longue (Post)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setDescriptionFormat('story'); setDescriptionBook({...book, description: book.longDescription || book.description}); }}
                                                                                className="text-teal-600 hover:text-teal-900 p-2 hover:bg-teal-50 rounded transition-colors"
                                                                                title="Générer Description Longue (Story)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setN8nFormat('post'); setN8nBook(book); }}
                                                                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                                                                title="Publier / Programmer via n8n (FB/Insta)"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleQuickPublish(book)}
                                                                                disabled={quickPublishing === book.id}
                                                                                className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded transition-colors disabled:opacity-40"
                                                                                title="Publier maintenant (FB+Insta) sans options"
                                                                            >
                                                                                {quickPublishing === book.id
                                                                                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                                                                    : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                                                }
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleQuickEdit(book)}
                                                                                className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded transition-colors"
                                                                                title="Modification Rapide"
                                                                            >
                                                                                <Edit3 className="w-4 h-4" />
                                                                            </button>
                                                                            <Link
                                                                                href={`/admin/books/${book.id}/edit?${new URLSearchParams({ page: pageNumber.toString(), ...(initialSearch ? {search: initialSearch} : {}), ...(initialFilter ? {filter: initialFilter} : {}) }).toString()}`}
                                                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                                                title="Modification Complète"
                                                                            >
                                                                                <Edit className="w-4 h-4" />
                                                                            </Link>
                                                                            <button
                                                                                onClick={() => handleDelete(book.id, book.title)}
                                                                                disabled={loading === book.id}
                                                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </tbody>
                                    )}
                                </Droppable>
                            </table>
                        </DragDropContext>
                    </div>

                    {viewMode === 'kanban' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4 p-4">
                            {orderedBooks.map(book => (
                                <div key={book.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 relative group">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 p-1 rounded-lg shadow-sm backdrop-blur-sm">
                                        <button onClick={() => handleToggleStatus(book.id, book.active)} className={`p-1.5 rounded-md ${book.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100'}`} title={book.active ? 'Désactiver' : 'Activer'}>
                                            {book.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        </button>
                                        <Link href={`/admin/books/${book.id}/edit?${new URLSearchParams({ page: pageNumber.toString(), ...(initialSearch ? {search: initialSearch} : {}), ...(initialFilter ? {filter: initialFilter} : {}) }).toString()}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md">
                                            <Edit className="w-3.5 h-3.5" />
                                        </Link>
                                        <button onClick={() => handleDelete(book.id, book.title)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                                        <img src={normalizeImage(book.image)} alt={book.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/book-placeholder.png' }} />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{book.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>
                                        <div className="mt-auto pt-3 flex items-center justify-between">
                                            <span className="font-black text-sm text-gray-900">{book.price} <span className="text-[10px] text-gray-500">MAD</span></span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${book.stock > 10 ? 'bg-green-100 text-green-700' : book.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                {book.stock} en stock
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`px-6 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${totalProviderPages > 1 ? '' : 'hidden'}`}>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{pageNumber}</span> sur <span className="font-medium">{totalProviderPages}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <button
                                onClick={() => router.push(buildUrl(pageNumber - 1))}
                                disabled={pageNumber === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Précédent
                            </button>
                            
                            <div className="hidden sm:flex items-center gap-1">
                                {renderPaginationNumbers()}
                            </div>

                            <button
                                onClick={() => router.push(buildUrl(pageNumber + 1))}
                                disabled={pageNumber === totalProviderPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </>
            )}

            <BookCreativeModal
                isOpen={!!creativeBook}
                onClose={() => setCreativeBook(null)}
                book={creativeBook}
                format={creativeFormat}
            />

            <BookDescriptionModal
                isOpen={!!descriptionBook}
                onClose={() => setDescriptionBook(null)}
                book={descriptionBook}
                format={descriptionFormat}
            />

            <N8nPublishModal
                isOpen={!!n8nBook}
                onClose={() => setN8nBook(null)}
                book={n8nBook}
                format={n8nFormat}
            />
        </div>
    )
}
