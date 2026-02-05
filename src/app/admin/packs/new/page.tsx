import { getBooks } from '@/lib/db/books'
import PackForm from './PackForm'

export default async function NewPackPage() {
    const books = await getBooks({ active: true })

    return <PackForm books={books} />
}
