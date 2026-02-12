import { getCommunityUser } from '@/lib/actions/community-auth'
import Header from './Header'
import NotificationDropdownWrapper from './NotificationDropdownWrapper'
import { getActiveMenuBySlug } from '@/lib/actions/menus'

export default async function HeaderWithUser() {
    const [user, menu] = await Promise.all([
        getCommunityUser(),
        getActiveMenuBySlug('header')
    ])

    const userProps = user ? {
        fullName: user.fullName,
        email: user.email,
        image: user.image,
    } : null

    return (
        <Header
            user={userProps}
            notificationDropdown={user ? <NotificationDropdownWrapper /> : null}
            navigation={menu?.items}
        />
    )
}
