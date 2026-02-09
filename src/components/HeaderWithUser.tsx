import { getCommunityUser } from '@/lib/actions/community-auth'
import Header from './Header'
import NotificationDropdownWrapper from './NotificationDropdownWrapper'

export default async function HeaderWithUser() {
    const user = await getCommunityUser()

    const userProps = user ? {
        fullName: user.fullName,
        email: user.email,
        image: user.image,
    } : null

    return <Header user={userProps} notificationDropdown={user ? <NotificationDropdownWrapper /> : null} />
}
