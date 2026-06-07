import { getPackById } from '@/lib/actions/packs'
import { getBooks } from '@/lib/db/products'
import { notFound } from 'next/navigation'
import PackEditForm from './PackEditForm'
import { getSetting } from '@/lib/actions/site-settings'

export default async function EditPackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const [packResult, products, whatsappPhone] = await Promise.all([
        getPackById(id),
        getBooks({ includeInactive: true, limit: 1000 }),
        getSetting('contact_whatsapp')
    ])

    // Debug temporaire
    console.log('[EditPackPage] id:', id, '| result:', JSON.stringify(packResult))

    if (!packResult.success || !packResult.data) {
        notFound()
    }

    const pack = packResult.data
    const selectedBookIds = pack.products.map(pb => pb.productId)

    return (
        <PackEditForm
            pack={{
                id: pack.id,
                name: pack.name,
                description: pack.description || '',
                price: pack.price,
                image: pack.image || '',
                isFreeDelivery: pack.isFreeDelivery,
                shippingFees: pack.shippingFees,
                selectedBookIds
            }}
            products={products}
            whatsappPhone={whatsappPhone || undefined}
        />
    )
}
