import { getCommunityUser } from '@/lib/actions/community-auth'
import HeaderWithUser from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import CheckoutClient from '@/components/checkout/CheckoutClient'

export default async function CheckoutPage() {
    const user = await getCommunityUser()

    const userProps = user ? {
        fullName: user.fullName,
        email: user.email,
        image: user.image,
    } : null

    return (
        <div className="min-h-screen bg-pixio-cream">
            <HeaderWithUser />
            <CheckoutClient user={userProps} />
            <Footer />
        </div>
    )
}
