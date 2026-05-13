import { NextResponse } from 'next/server'
import { markAllNotificationsAsRead } from '@/lib/actions/community-notifications'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

export async function POST() {
    try {
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`notif_mark_all_${ip}`, { limit: 20, windowMs: 60000 })
        if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

        const result = await markAllNotificationsAsRead()

        if (result.success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
