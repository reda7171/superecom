import { getBooks } from '@/lib/db/books'
import PackForm from './PackForm'
import { getSetting } from '@/lib/actions/site-settings'

export default async function NewPackPage() {
    const [books, whatsappPhone] = await Promise.all([
        getBooks({ includeInactive: true, limit: 1000 }),
        getSetting('contact_whatsapp')
    ])

    return <PackForm books={books} whatsappPhone={whatsappPhone || undefined} />
}
