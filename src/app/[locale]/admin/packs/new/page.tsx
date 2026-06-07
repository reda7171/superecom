import { getBooks } from '@/lib/db/products'
import PackForm from './PackForm'
import { getSetting } from '@/lib/actions/site-settings'

export default async function NewPackPage() {
    const [products, whatsappPhone] = await Promise.all([
        getBooks({ includeInactive: true, limit: 1000 }),
        getSetting('contact_whatsapp')
    ])

    return <PackForm products={products} whatsappPhone={whatsappPhone || undefined} />
}
