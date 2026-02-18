import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Webhook Olivraison - Réception des mises à jour de statut
 * Endpoint: POST /api/webhooks/olivraison
 * 
 * Documentation Olivraison: attendre la structure exacte du webhook
 */

// Mapping des statuts Olivraison → Statuts locaux
const STATUS_MAPPING: Record<string, string> = {
    'CREATED': 'PENDING',
    'CONFIRMED': 'CONFIRMED',
    'PICKED_UP': 'IN_TRANSIT',
    'IN_TRANSIT': 'IN_TRANSIT',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'FAILED': 'FAILED',
    'RETURNED': 'RETURNED',
    'CANCELLED': 'CANCELLED'
}

/**
 * Vérifier la signature HMAC du webhook
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        const expectedSignature = createHmac('sha256', secret)
            .update(payload)
            .digest('hex')

        const expectedBuffer = Buffer.from(expectedSignature, 'hex')
        const receivedBuffer = Buffer.from(signature, 'hex')

        // Utiliser timingSafeEqual pour éviter les timing attacks
        return expectedBuffer.length === receivedBuffer.length &&
            timingSafeEqual(expectedBuffer, receivedBuffer)
    } catch {
        return false
    }
}

export async function POST(request: NextRequest) {
    try {
        // OWASP A04: Rate Limiting pour webhooks
        const ip = await getIpIdentifier()
        const limiter = await rateLimit(`webhook_${ip}`, { limit: 100, windowMs: 60000 })

        if (!limiter.success) {
            console.warn(`[SECURITY] Webhook rate limit exceeded from IP: ${ip}`)
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            )
        }

        // OWASP A02: Vérification cryptographique du webhook
        const webhookSecret = process.env.OLIVRAISON_WEBHOOK_SECRET

        if (!webhookSecret) {
            console.error('[CONFIG ERROR] OLIVRAISON_WEBHOOK_SECRET not configured')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        // Lire le body brut pour vérification signature
        const rawBody = await request.text()
        const signature = request.headers.get('x-olivraison-signature') || ''

        // Vérifier la signature HMAC
        if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
            console.error('[SECURITY] Invalid webhook signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        // Parser le JSON après vérification
        const payload = JSON.parse(rawBody)

        console.log('📦 Webhook Olivraison reçu:', {
            trackingID: payload.trackingID,
            status: payload.status,
            timestamp: new Date().toISOString()
        })

        // OWASP A03: Validation et sanitization des inputs
        const {
            trackingID,
            status,
            comment,
            updateAt
        } = payload

        if (!trackingID || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: trackingID or status' },
                { status: 400 }
            )
        }

        // Valider le format du trackingID (UUID ou format Olivraison)
        if (typeof trackingID !== 'string' || trackingID.length > 100) {
            return NextResponse.json(
                { error: 'Invalid trackingID format' },
                { status: 400 }
            )
        }

        // Valider que le statut est dans la liste autorisée
        if (!Object.keys(STATUS_MAPPING).includes(status)) {
            console.warn(`[SECURITY] Unknown status received: ${status}`)
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            )
        }

        // Sanitize comment pour éviter XSS
        const sanitizedComment = comment ? sanitizeInput(comment.substring(0, 500)) : undefined

        // Trouver la commande correspondante
        const order = await prisma.order.findFirst({
            where: { trackingID }
        })

        if (!order) {
            console.warn(`⚠️ Commande introuvable pour trackingID: ${trackingID}`)
            return NextResponse.json(
                { message: 'Order not found, but webhook received' },
                { status: 200 } // Retourner 200 pour éviter les retries Olivraison
            )
        }

        // Mapper le statut Olivraison → statut local
        const localStatus = STATUS_MAPPING[status]

        // Mettre à jour la commande et ajouter à l'historique
        await prisma.order.update({
            where: { id: order.id },
            data: {
                deliveryStatus: status,
                ...(localStatus === 'DELIVERED' && { status: 'DELIVERED' }),
                ...(localStatus === 'CANCELLED' && { status: 'CANCELLED' }),
                deliverySyncAt: new Date(),
                deliveryNotes: sanitizedComment,
                statusHistory: {
                    create: {
                        status: localStatus,
                        comment: sanitizedComment || `Mise à jour automatique via Olivraison: ${status}`,
                        createdBy: 'SYSTEM_WEBHOOK'
                    }
                }
            }
        })

        // Revalider les pages affectées
        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${order.id}`)
        revalidatePath('/orders') // Page client

        console.log(`✅ Commande ${order.id} mise à jour: ${status}`)

        // TODO: Envoyer un email au client si statut important (DELIVERED, FAILED, etc.)
        if (['DELIVERED', 'OUT_FOR_DELIVERY', 'FAILED'].includes(status)) {
            // await sendOrderStatusEmail(order, status)
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully',
            orderId: order.id,
            newStatus: localStatus
        })

    } catch (error: any) {
        console.error('❌ Erreur Webhook Olivraison:', error.message)

        // OWASP A09: Ne pas exposer les détails d'erreur
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Endpoint GET pour vérifier que le webhook est actif
export async function GET() {
    return NextResponse.json({
        service: 'Olivraison Webhook Endpoint',
        status: 'active',
        timestamp: new Date().toISOString()
    })
}
