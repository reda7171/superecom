import { getUserNotifications, getUnreadNotificationsCount } from '@/lib/actions/community-notifications'
import NotificationDropdown from './NotificationDropdown'

export default async function NotificationDropdownWrapper() {
    const [notifications, unreadCount] = await Promise.all([
        getUserNotifications(),
        getUnreadNotificationsCount()
    ])

    if (!notifications) {
        return null
    }

    return (
        <NotificationDropdown
            initialNotifications={notifications}
            unreadCount={unreadCount}
        />
    )
}
