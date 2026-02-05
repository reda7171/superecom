'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CouponSchema = z.object({
    code: z.string().min(3, 'Le code doit contenir au moins 3 caractères').toUpperCase(),
    discount: z.number().positive('La remise doit être positive'),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    minAmount: z.number().optional().nullable(),
    isActive: z.boolean().default(true),
    expiresAt: z.string().optional().nullable(),
})

export async function getCoupons() {
    return prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function createCoupon(data: z.infer<typeof CouponSchema>) {
    try {
        const validated = CouponSchema.parse(data)

        await prisma.coupon.create({
            data: {
                ...validated,
                expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
            }
        })

        revalidatePath('/admin/coupons')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la création' }
    }
}

export async function deleteCoupon(id: string) {
    try {
        await prisma.coupon.delete({ where: { id } })
        revalidatePath('/admin/coupons')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}

export async function validateCoupon(code: string, cartTotal: number) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase(), isActive: true }
        })

        if (!coupon) {
            return { success: false, error: 'Code promo invalide' }
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { success: false, error: 'Code promo expiré' }
        }

        if (coupon.minAmount && cartTotal < coupon.minAmount) {
            return { success: false, error: `Montant minimum requis: ${coupon.minAmount} MAD` }
        }

        return {
            success: true,
            coupon: {
                code: coupon.code,
                discount: coupon.discount,
                type: coupon.type
            }
        }
    } catch (error) {
        return { success: false, error: 'Une erreur est survenue' }
    }
}
