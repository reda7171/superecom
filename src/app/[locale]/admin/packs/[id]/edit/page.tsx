import { getPackById } from '@/lib/actions/packs'
import { getBooks } from '@/lib/db/books'
import { notFound } from 'next/navigation'
import PackEditForm from './PackEditForm'

export default async function EditPackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const [packResult, books] = await Promise.all([
        getPackById(id),
        getBooks({ active: true })
    ])

    if (!packResult.success || !packResult.data) {
        notFound()
    }

    const pack = packResult.data
    const selectedBookIds = pack.books.map(pb => pb.bookId)

    return (
        <PackEditForm
            pack={{
                id: pack.id,
                name: pack.name,
                description: pack.description || '',
                price: pack.price,
                image: pack.image || '',
                selectedBookIds
            }}
            books={books}
        />
    )
}
