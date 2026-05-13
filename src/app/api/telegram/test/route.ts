import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/actions/auth'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: Request) {
    try {
        await verifyAdmin()
        
        const { botToken, chatId } = await req.json()
        
        if (!botToken || !chatId) {
            return NextResponse.json({ ok: false, error: 'Token ou Chat ID manquant' }, { status: 400 })
        }

        const res = await sendTelegramMessage('✅ Configuration Telegram réussie ! Les nouvelles commandes apparaîtront ici.', chatId, botToken)

        if (!res.ok) {
            return NextResponse.json({ ok: false, error: res.description || 'Erreur API Telegram' }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
