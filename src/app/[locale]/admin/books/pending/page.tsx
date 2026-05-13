import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'
import { normalizeImage } from '@/lib/utils'
import PendingBooksTable from './PendingBooksTable'

export default async function PendingBooksPage() {
    const books = await prisma.book.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
            seller: {
                select: { fullName: true, email: true }
            }
        }
    })

    const normalizedBooks = books.map(b => ({ ...b, image: normalizeImage(b.image) }))

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/books" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Livres en attente d'approbation</h1>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Examinez et validez les livres ajoutés par les vendeurs.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                <PendingBooksTable books={normalizedBooks} />
            </div>
        </div>
    )
}
