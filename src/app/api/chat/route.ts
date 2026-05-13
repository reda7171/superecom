import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { chatWithDatabase } from '@/lib/gemini'

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        const limiter = await rateLimit(`chat_${ip}`, { limit: 20, windowMs: 60000 })
        if (!limiter.success) return NextResponse.json({ reply: "..." }, { status: 429 })

        const { message, locale } = await req.json()
        if (!message) return NextResponse.json({ reply: "..." }, { status: 400 })

        // Utilisation de l'IA Gemini avec accès à la DB
        const result = await chatWithDatabase(message, locale)

        // Notification Telegram ChatBot (optionnel)
        try {
            const { getSetting } = await import('@/lib/actions/site-settings')
            const shouldNotify = await getSetting('telegram_notify_chat') === 'true'

            if (shouldNotify) {
                const { sendTelegramMessage } = await import('@/lib/telegram')
                const replyText = result.text
                await sendTelegramMessage(
                    `🤖 <b>Assistant Riwaya (Gemini)</b>\n\n` +
                    `👤 <b>User:</b> ${message}\n` +
                    `🤖 <b>AI:</b> ${replyText.slice(0, 300)}${replyText.length > 300 ? '...' : ''}\n` +
                    `🌐 <b>IP:</b> ${ip}`
                )
            }
        } catch (e) {
            // Ignorer erreur notification
        }
        
        return NextResponse.json({ 
            reply: result.text,
            type: result.type,
            data: result.data
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ reply: "Désolé, je suis un peu fatigué. Réessayez plus tard ! 😴" }, { status: 500 })
    }
}
