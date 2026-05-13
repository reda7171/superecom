import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import CartClient from '@/components/cart/CartClient'
import { getSetting } from '@/lib/actions/site-settings'
import { getPopularBooks } from '@/lib/db/books'

export default async function CartPage() {
    const minAmount = await getSetting('min_order_amount', '0')
    const recommendedBooks = await getPopularBooks(4)

    return (
        <div className="min-h-screen bg-pixio-cream text-black">
            <Header />

            <CartClient 
                minOrderAmount={Number(minAmount)} 
                recommendedBooks={JSON.parse(JSON.stringify(recommendedBooks))} 
            />

            <Footer />
        </div>
    )
}
