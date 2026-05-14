import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook Facebook / Instagram
 * Sert à la vérification par Meta et à la réception des notifications
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Récupérer le token de vérification depuis le .env ou la DB
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'riwaya_secret_token_2026'

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('[FB WEBHOOK] Verified successfully')
            // Meta attend impérativement le challenge en texte brut (text/plain)
            return new Response(challenge, { 
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            })
        } else {
            console.error('[FB WEBHOOK] Verification failed')
            return new Response('Forbidden', { status: 403 })
        }
    }

    return NextResponse.json({ message: 'Facebook Webhook Endpoint' })
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        console.log('[FB WEBHOOK] Received event:', JSON.stringify(body, null, 2))

        // Ici vous pouvez traiter les commentaires Instagram, les messages Messenger, etc.
        // Exemple: body.entry[0].changes[0].value...

        return NextResponse.json({ status: 'received' })
    } catch (error) {
        console.error('[FB WEBHOOK] Error processing event:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
