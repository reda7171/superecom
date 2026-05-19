import { NextResponse } from 'next/server'
import { getAllSettings } from '@/lib/actions/site-settings'
import { verifyAdmin } from '@/lib/actions/auth'

export async function GET() {
    try {
        await verifyAdmin()
        const settings = await getAllSettings()
        return NextResponse.json({ success: true, settings })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
}
