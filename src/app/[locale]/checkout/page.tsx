import { getCommunityUser } from '@/lib/actions/community-auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutClient from '@/components/checkout/CheckoutClient'
import NotificationDropdownWrapper from '@/components/NotificationDropdownWrapper'

export default async function CheckoutPage() {
    const user = await getCommunityUser()

    const userProps = user ? {
        fullName: user.fullName,
        email: user.email,
        image: user.image,
    } : null

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header user={userProps} notificationDropdown={user ? <NotificationDropdownWrapper /> : null} />
            <CheckoutClient user={userProps} />
            <Footer />
        </div>
    )
}
