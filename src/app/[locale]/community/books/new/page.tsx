import AddBookForm from '@/components/community/AddBookForm'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { redirect } from 'next/navigation'

export default async function AddBookPage() {
    const user = await getCommunityUser()

    if (!user) {
        redirect('/community/login')
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-20">
                <AddBookForm />
            </main>
            <Footer />
        </div>
    )
}
