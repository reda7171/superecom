import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import CartClient from '@/components/cart/CartClient'

export default function CartPage() {
    return (
        <div className="min-h-screen bg-pixio-cream text-black">
            <Header />

            <CartClient />

            <Footer />
        </div>
    )
}
