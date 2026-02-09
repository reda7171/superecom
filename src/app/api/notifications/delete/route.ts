import { NextRequest, NextResponse } from 'next/server'
import { deleteNotification } from '@/lib/actions/community-notifications'

export async function POST(request: NextRequest) {
    try {
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
