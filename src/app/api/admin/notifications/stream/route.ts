import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder()

    // Récupérer l'ID de la dernière commande connue au démarrage
    let lastOrderId: string | null = null
    try {
        const latest = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { id: true }
        })
        lastOrderId = latest?.id ?? null
    } catch {}

    const stream = new ReadableStream({
        start(controller) {
            // Envoyer un ping initial
            controller.enqueue(encoder.encode(`data: {"type":"connected"}\n\n`))

            const interval = setInterval(async () => {
                try {
                    // Chercher les nouvelles commandes depuis la dernière connue
                    const where = lastOrderId
                        ? { createdAt: { gt: (await prisma.order.findUnique({ where: { id: lastOrderId }, select: { createdAt: true } }))?.createdAt } }
                        : {}

                    const newOrders = await prisma.order.findMany({
                        where,
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                        select: { id: true, fullName: true, total: true, city: true, createdAt: true, status: true }
                    })

                    if (newOrders.length > 0) {
                        lastOrderId = newOrders[0].id
                        const payload = JSON.stringify({ type: 'new_orders', orders: newOrders })
                        controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
                    } else {
                        // Ping de maintien
                        controller.enqueue(encoder.encode(`:ping\n\n`))
                    }
                } catch (e) {
                    // Ignorer les erreurs DB temporaires
                }
            }, 15000) // toutes les 15s

            // Nettoyage si le client se déconnecte
            req.signal.addEventListener('abort', () => {
                clearInterval(interval)
                try { controller.close() } catch {}
            })
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    })
}
