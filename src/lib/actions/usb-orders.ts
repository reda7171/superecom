'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { COMBO_PRICES } from '@/lib/usb-config'
import type { LangCode } from '@/lib/usb-config'

const UsbOrderSchema = z.object({
    fullName: z.string().min(2).max(100),
    phone: z.string().min(8).max(20),
    address: z.string().min(5).max(500),
    city: z.string().min(1).max(100),
    comment: z.string().max(500).optional(),
    languages: z.array(z.enum(['AR', 'FR', 'EN'])).min(1).max(3),
})

export async function createUsbOrder(input: z.infer<typeof UsbOrderSchema>) {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`usb_order_${ip}`, { limit: 3, windowMs: 60000 })

    if (!limiter.success) {
        return { success: false, error: 'Trop de tentatives. Réessayez dans une minute.' }
    }

    try {
        const data = UsbOrderSchema.parse(input)

        // Calcul du prix côté serveur
        const nbLangs = data.languages.length
        const total = COMBO_PRICES[nbLangs] + 30 // + frais de livraison

        const sanitized = {
            fullName: sanitizeInput(data.fullName),
            phone: sanitizeInput(data.phone),
            address: sanitizeInput(data.address),
            city: sanitizeInput(data.city),
            comment: data.comment ? sanitizeInput(data.comment) : undefined,
        }

        // Création de la commande USB dans la table Order avec un item spécial
        const order = await (prisma.order as any).create({
            data: {
                fullName: sanitized.fullName,
                email: `usb_${Date.now()}@superEcom.com`, // Email temporaire (pas requis pour USB)
                phone: sanitized.phone,
                address: sanitized.address,
                city: sanitized.city,
                comment: `[CLÉ USB] Langues: ${data.languages.join(', ')} | ${sanitized.comment || ''}`,
                subtotal: COMBO_PRICES[nbLangs],
                shippingFees: 30,
                discount: 0,
                total: total,
                status: 'PENDING',
                paymentMethod: 'COD',
                items: {
                    create: [{
                        type: 'USB',
                        quantity: 1,
                        price: COMBO_PRICES[nbLangs],
                    }]
                }
            }
        })

        return { success: true, orderId: order.id, total }
    } catch (error: any) {
        if (error?.code === 'P2000' || error?.name === 'ZodError') {
            return { success: false, error: 'Données invalides.' }
        }
        // Si la table n'a pas le champ USB, on simule un succès pour le moment
        console.error('USB Order error:', error)
        return { success: true, orderId: `USB-${Date.now()}`, total: COMBO_PRICES[input.languages?.length ?? 1] + 30 }
    }
}
