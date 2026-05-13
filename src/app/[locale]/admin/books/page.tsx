import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import BooksTable from './BooksTable'
import { normalizeImage } from '@/lib/utils'
import CatalogButton from '@/components/admin/CatalogButton'
import CatalogImageButton from '@/components/admin/CatalogImageButton'
import EmptyLibraryButton from '@/components/admin/EmptyLibraryButton'

import { Prisma } from '@prisma/client'

import BookFilters from './BookFilters'

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ page?: string, search?: string, filter?: string, limit?: string }> }) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const ITEMS_PER_PAGE = Number(params.limit) || 20
    const searchQuery = params.search || ''
    const filterParam = params.filter || ''

    const where: Prisma.BookWhereInput = {
        ...(searchQuery && {
            OR: [
                { title: { contains: searchQuery } },
                { author: { contains: searchQuery } },
                { category: { contains: searchQuery } }
            ]
        }),
        ...(filterParam === 'no-image' && {
            image: { in: ['', '/book-placeholder.png'] }
        }),
        ...(filterParam === 'out-of-stock' && {
            stock: { equals: 0 }
        }),
        ...(filterParam === 'in-stock' && {
            stock: { gt: 0 }
        }),
        ...(filterParam === 'active' && {
            active: true
        }),
        ...(filterParam === 'inactive' && {
            active: false
        }),
        ...(filterParam.startsWith('lang:') && {
            language: filterParam.split(':')[1]
        })
    }

    let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
    if (filterParam === 'price-asc') orderBy = [{ price: 'asc' }]
    else if (filterParam === 'price-desc') orderBy = [{ price: 'desc' }]
    else if (filterParam === 'stock-asc') orderBy = [{ stock: 'asc' }]
    else if (filterParam === 'stock-desc') orderBy = [{ stock: 'desc' }]
    else if (filterParam === 'title-asc') orderBy = [{ title: 'asc' }]
    else if (filterParam === 'title-desc') orderBy = [{ title: 'desc' }]

    const booksStats = await prisma.book.findMany({
        where,
        select: { stock: true, active: true, price: true }
    })

    const totalBooks = booksStats.length
    const activeBooks = booksStats.filter(b => b.active).length
    const totalStock = booksStats.reduce((sum, b) => sum + b.stock, 0)
    const stockValue = booksStats.reduce((sum, b) => sum + (b.price * b.stock), 0)

    const books = await prisma.book.findMany({
        where,
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        orderBy,
    })

    const normalizedBooks = books.map(b => ({ ...b, image: normalizeImage(b.image) }))
    const totalPages = Math.ceil(totalBooks / ITEMS_PER_PAGE)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion du Catalogue</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                        Gérez vos livres, stocks et publications sociales.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/admin/books/pending"
                        className="inline-flex items-center px-5 py-2.5 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-100 transition-colors"
                    >
                        En attente
                    </Link>
                    <div className="flex gap-2">
                        <CatalogButton />
                        <CatalogImageButton />
                    </div>
                    <Link
                        href="/admin/books/bulk-import"
                        className="inline-flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Importer
                    </Link>
                    <Link
                        href="/admin/books/new"
                        className="inline-flex items-center px-5 py-2.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-900 transition-all shadow-xl shadow-black/10 active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Livres', value: totalBooks, color: 'text-gray-900' },
                    { label: 'Livres Actifs', value: activeBooks, color: 'text-green-600' },
                    { label: 'Stock Total', value: totalStock, color: 'text-blue-600' },
                    { label: 'Valeur Stock', value: `${stockValue.toFixed(0)} MAD`, color: 'text-purple-600' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className={`mt-2 text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-8">
                {/* Search & Filters */}
                <BookFilters 
                    searchQuery={searchQuery}
                    filterParam={filterParam}
                    totalCount={totalBooks}
                />

                {/* Table Content */}
                <div className="w-full">
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                        <BooksTable 
                            books={normalizedBooks} 
                            pageNumber={currentPage} 
                            totalProviderPages={totalPages} 
                            initialSearch={searchQuery} 
                            initialFilter={filterParam} 
                            limit={ITEMS_PER_PAGE} 
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
