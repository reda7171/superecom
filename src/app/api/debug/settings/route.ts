import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { verifyAdmin } from '@/lib/actions/auth'

export async function GET(req: Request) {
    try {
        await verifyAdmin()
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const setToken = searchParams.get('set_token')

    if (setToken) {
        try {
            await prisma.siteSettings.upsert({
                where: { key: 'facebook_access_token' },
                update: { value: setToken, category: 'config', description: 'Facebook Access Token' },
                create: { key: 'facebook_access_token', value: setToken, category: 'config', description: 'Facebook Access Token' }
            })
            return NextResponse.json({ success: true, message: 'Token set successfully via debug API' })
        } catch (err: any) {
            console.error('Error in debug set_token:', err)
            return NextResponse.json({ success: false, error: err.message }, { status: 500 })
        }
    }

    try {
        const settings = await prisma.siteSettings.findMany()
        return NextResponse.json({ 
            success: true, 
            count: settings.length,
            settings: settings.map(s => ({
                key: s.key,
                category: s.category,
                hasValue: !!s.value,
                valuePreview: s.value ? s.value.substring(0, 10) + '...' : null
            }))
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
