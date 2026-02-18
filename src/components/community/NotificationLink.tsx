'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { markNotificationAsRead } from '@/lib/actions/community-notifications'

interface NotificationLinkProps {
    notificationId: string
    link: string | null
    read: boolean
    children: React.ReactNode
    className?: string
}

export default function NotificationLink({
    notificationId,
    link,
    read,
    children,
    className
}: NotificationLinkProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleClick(e: React.MouseEvent) {
        if (!read) {
            setLoading(true)
            await markNotificationAsRead(notificationId)
        }

        if (link) {
            router.push(link)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={className}
        >
            {children}
        </button>
    )
}
