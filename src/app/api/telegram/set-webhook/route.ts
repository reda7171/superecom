import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/actions/auth'
import { setTelegramWebhook } from '@/lib/telegram'

export async function POST(req: Request) {
    try {
        await verifyAdmin()
        
        const { botToken, webhookUrl } = await req.json()
        
        if (!botToken || !webhookUrl) {
            return NextResponse.json({ ok: false, error: 'Token ou Webhook URL manquant' }, { status: 400 })
        }

        const res = await setTelegramWebhook(webhookUrl, botToken)

        if (!res.ok) {
            return NextResponse.json({ ok: false, error: res.description || 'Erreur lors de la configuration du webhook' }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
