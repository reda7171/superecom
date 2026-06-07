'use server'

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function trackPageView(data: {
    url: string
    referrer: string | null
    userId?: string
    sessionId?: string
}) {
    try {
        const headersList = await headers()
        const userAgent = (headersList.get('user-agent') || '').substring(0, 1000)
        const safeUrl = data.url.substring(0, 2000)
        const safeReferrer = (data.referrer || '').substring(0, 2000)

        await prisma.pageView.create({
            data: {
                url: safeUrl,
                referrer: safeReferrer || null,
                userId: data.userId || null,
                sessionId: data.sessionId || null,
                userAgent: userAgent || null
            }
        })
    } catch (error) {
        console.error('Tracking Error:', error)
    }
}

export type TrackingResult = {
    success: boolean
    error?: string
    order?: any
}

export async function trackOrder(formData: FormData): Promise<TrackingResult> {
    const orderId = formData.get('orderId') as string
    const contact = formData.get('contact') as string

    if (!orderId || !contact) {
        return { success: false, error: 'Veuillez remplir tous les champs' }
    }

    try {
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: { startsWith: orderId.toLowerCase() } },
                    { trackingID: orderId }
                ]
            },
            include: {
                items: {
                    include: {
                        product: true,
                        pack: true,
                        gift: true,
                        digitalProduct: true
                    }
                }
            }
        })

        if (!order) {
            return { success: false, error: 'Commande introuvable' }
        }

        const isValidContact = order.email === contact || order.phone === contact

        if (!isValidContact) {
            return { success: false, error: 'Les informations de contact ne correspondent pas' }
        }

        return { success: true, order }
    } catch (error) {
        console.error('Track Order Error:', error)
        return { success: false, error: 'Erreur lors de la recherche de la commande' }
    }
}
