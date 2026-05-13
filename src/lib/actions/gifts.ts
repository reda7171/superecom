'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin } from './auth'

const GiftSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    description: z.string().optional().nullable(),
    price: z.number().min(0, 'Le prix doit être positif ou nul'),
    minAmount: z.number().min(0, 'Le montant minimum doit être positif ou nul'),
    image: z.string().optional().nullable(),
    active: z.boolean().default(true),
})

export async function getGifts() {
    try {
        return await prisma.gift.findMany({
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        return []
    }
}

export async function getActiveGifts() {
    try {
        return await prisma.gift.findMany({
            where: { active: true },
            orderBy: { price: 'asc' }
        })
    } catch (error) {
        return []
    }
}

export async function createGift(data: z.infer<typeof GiftSchema>) {
    try {
        await verifyAdmin()
        const validated = GiftSchema.parse(data)

        await prisma.gift.create({
            data: validated
        })

        revalidatePath('/admin/gifts')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la création' }
    }
}

export async function updateGift(id: string, data: z.infer<typeof GiftSchema>) {
    try {
        await verifyAdmin()
        const validated = GiftSchema.parse(data)

        await prisma.gift.update({
            where: { id },
            data: validated
        })

        revalidatePath('/admin/gifts')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la modification' }
    }
}

export async function toggleGiftStatus(id: string, active: boolean) {
    try {
        await verifyAdmin()
        await prisma.gift.update({
            where: { id },
            data: { active }
        })
        revalidatePath('/admin/gifts')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la modification' }
    }
}

export async function deleteGift(id: string) {
    try {
        await verifyAdmin()
        await prisma.gift.delete({ where: { id } })
        revalidatePath('/admin/gifts')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la suppression' }
    }
}
