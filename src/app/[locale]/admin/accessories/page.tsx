import { prisma } from '@/lib/prisma'
import AccessoriesTable from './AccessoriesTable'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'

export default async function AccessoriesPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ category?: string }>
}) {
    const { locale } = await params
    const { category } = await searchParams

    const accessories = await prisma.extraProduct.findMany({
        where: category ? { category: category.toUpperCase() } : undefined,
        orderBy: { createdAt: 'desc' }
    })

    const title = category 
        ? category.toUpperCase() === 'BOOKMARK' ? 'Marque-pages' 
        : category.toUpperCase() === 'LIBRARY' ? 'Bibliothèques'
        : category.toUpperCase() === 'USB' ? 'Clés USB'
        : category.toUpperCase() === 'KIDS' ? 'Produits enfants'
        : 'Accessoires'
        : 'Tous les Accessoires'

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-sm font-medium text-slate-500">Gérez vos produits complémentaires</p>
                    </div>
                </div>
                <Link
                    href={`/${locale}/admin/accessories/new${category ? `?category=${category}` : ''}`}
                    className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Produit
                </Link>
            </div>

            <AccessoriesTable initialData={JSON.parse(JSON.stringify(accessories))} locale={locale} />
        </div>
    )
}
