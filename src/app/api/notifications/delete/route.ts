import { NextRequest, NextResponse } from 'next/server'
import { deleteNotification } from '@/lib/actions/community-notifications'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
    try {
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`notif_delete_${ip}`, { limit: 20, windowMs: 60000 })
        if (!limiter.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

        const { notificationId } = await request.json()

        if (!notificationId) {
            return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 })
        }

        const result = await deleteNotification(notificationId)

        if (result.success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
