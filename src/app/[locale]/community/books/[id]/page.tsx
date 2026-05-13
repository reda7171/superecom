import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { getExchangeBook } from '@/lib/actions/community-books'
import { redirect } from 'next/navigation'
import EditBookForm from '@/components/community/EditBookForm'

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

    const book = await getExchangeBook(id)

    if (!book) {
        redirect('/community') // Rediriger si on essaie d'accéder au livre de quelqu'un d'autre ou si supprimé
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-20">
                <EditBookForm book={book} />
            </main>
            <Footer />
        </div>
    )
}
