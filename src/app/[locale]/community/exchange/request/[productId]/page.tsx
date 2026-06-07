import { getExchangeDetails } from '@/lib/actions/community-exchanges'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import ExchangeForm from '@/components/community/ExchangeForm'
import { redirect } from 'next/navigation'

export default async function ExchangeRequestPage({
    params
}: {
    params: Promise<{ productId: string }>
}) {
    const { productId } = await params
    const details = await getExchangeDetails(productId)

    if (!details) {
        redirect('/community/market')
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-10">
                <ExchangeForm details={details} />
            </main>
            <Footer />
        </div>
    )
}
