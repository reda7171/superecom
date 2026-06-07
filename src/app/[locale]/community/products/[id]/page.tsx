import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { getExchangeBook } from '@/lib/actions/community-products'
import { redirect } from 'next/navigation'
import EditProductForm from '@/components/community/EditProductForm'

export default async function EditBookPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    
    const user = await getCommunityUser()

    if (!user) {
        redirect('/community/login')
    }

    const product = await getExchangeBook(id)

    if (!product) {
        redirect('/community') // Rediriger si on essaie d'accéder au livre de quelqu'un d'autre ou si supprimé
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-20">
                <EditProductForm product={product} />
            </main>
            <Footer />
        </div>
    )
}
