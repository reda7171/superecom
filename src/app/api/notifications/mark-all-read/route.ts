import { NextResponse } from 'next/server'
import { markAllNotificationsAsRead } from '@/lib/actions/community-notifications'

export async function POST() {
    try {
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
