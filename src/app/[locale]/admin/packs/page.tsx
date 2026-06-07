import { adminGetPacks } from '@/lib/db/packs'
import { getBooks } from '@/lib/db/products'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import PacksTable from './PacksTable'

export default async function PacksPage() {
    const [packs, products] = await Promise.all([
        adminGetPacks(),
        getBooks({ active: true }),
    ])

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Packs</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Créez et gérez vos offres groupées
                    </p>
                </div>
                <Link
                    href="/admin/packs/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Créer un pack
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Total Packs</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{packs.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Packs Actifs</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {packs.filter(p => p.active).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Livres Disponibles</p>
                    <p className="mt-2 text-3xl font-bold text-blue-600">{products.length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                <PacksTable packs={packs} />
            </div>
        </div>
    )
}
