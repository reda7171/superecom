'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const TrackingSchema = z.object({
    orderId: z.string().uuid("Numéro de commande invalide"),
    contact: z.string().min(1, "L'email ou le téléphone est requis")
})

export type TrackingResult =
    | { success: false; error: string }
    | {
        success: true;
        order: {
            id: string;
            status: string;
            createdAt: Date;
            total: number;
            items: { title: string; quantity: number }[];
        }
    }

export async function trackOrder(formData: FormData): Promise<TrackingResult> {
    const rawData = {
        orderId: formData.get('orderId'),
        contact: formData.get('contact')
    }

    try {
        const data = TrackingSchema.parse(rawData)

        // Recherche de la commande
        // On vérifie que le contact correspond soit à l'email soit au téléphone
        const order = await prisma.order.findFirst({
            where: {
                id: data.orderId,
                OR: [
                    { email: data.contact },
                    { phone: data.contact }
                ]
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                total: true,
                items: {
                    select: {
                        quantity: true,
                        book: { select: { title: true } },
                        pack: { select: { name: true } }
                    }
                }
            }
        })

        if (!order) {
            return {
                success: false,
                error: "Commande introuvable. Vérifiez le numéro de commande et votre email/téléphone."
            }
        }

        // Formatage des données pour le front
        return {
            success: true,
            order: {
                id: order.id,
                status: order.status,
                createdAt: order.createdAt,
                total: order.total,
                items: (order as any).items.map((item: any) => ({
                    title: item.book?.title || item.pack?.name || "Article",
                    quantity: item.quantity
                }))
            }
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }
        return { success: false, error: "Une erreur est survenue lors de la recherche." }
    }
}
