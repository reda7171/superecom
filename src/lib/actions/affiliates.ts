'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdmin, getAdminUser } from './auth'

import bcrypt from 'bcryptjs'

const AffiliateSchema = z.object({
    code: z.string().min(3, 'Le code doit contenir au moins 3 caractères').toUpperCase(),
    discount: z.number().positive('La remise doit être supérieure à 0'),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    affiliateName: z.string().min(2, 'Le nom de l\'influenceur est requis'),
    email: z.string().email('Email de l\'influenceur requis'),
    password: z.string().min(6, 'Mot de passe (min 6 caractères) requis pour le compte'),
    commission: z.number().min(0, 'La commission ne peut pas être négative'),
    isActive: z.boolean().default(true),
})

export async function getAffiliates() {
    try {
        await verifyAdmin()
        
        // Fetch only affiliate coupons
        const affiliates = await prisma.coupon.findMany({
            where: { isAffiliate: true },
            orderBy: { createdAt: 'desc' }
        })

        // Fetch usage stats with items to count products
        const orders = await prisma.order.findMany({
            where: {
                couponCode: { in: affiliates.map(a => a.code) },
                status: { notIn: ['CANCELLED', 'FAILED', 'RETURNED'] }
            },
            include: {
                items: true
            }
        })

        const mappedAffiliates = affiliates.map(affiliate => {
            const affiliateOrders = orders.filter(o => o.couponCode === affiliate.code)
            const usageCount = affiliateOrders.length
            const generatedRevenue = affiliateOrders.reduce((sum, order) => sum + order.total, 0)
            
            // Compter le nombre total de livres/packs vendus (quantité cumulée)
            const totalItemsCount = affiliateOrders.reduce((sum, order) => {
                return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
            }, 0)

            // Calcul de la commission
            let totalCommission = 0
            if (affiliate.commission) {
                if (affiliate.type === 'PERCENTAGE') {
                    // Si la commission est un % des revenus générés
                    totalCommission = (generatedRevenue * affiliate.commission) / 100
                } else {
                    // Commission "PAR LIVRE" : quantité totale d'articles * montant commission
                    totalCommission = totalItemsCount * affiliate.commission
                }
            }

            return {
                ...affiliate,
                usageCount,
                totalItemsCount,
                generatedRevenue,
                totalCommission
            }
        })

        return mappedAffiliates
    } catch (error) {
        return []
    }
}

export async function createAffiliate(data: z.infer<typeof AffiliateSchema>) {
    try {
        await verifyAdmin()
        const validated = AffiliateSchema.parse(data)

        // 1. Créer le compte utilisateur pour l'influenceur
        const hashedPassword = await bcrypt.hash(validated.password, 10)
        
        const user = await prisma.user.create({
            data: {
                email: validated.email,
                password: hashedPassword,
                fullName: validated.affiliateName,
                role: 'INFLUENCER'
            }
        })

        // Notification Telegram
        try {
            const { sendUserRegistrationNotification } = await import('@/lib/telegram')
            await sendUserRegistrationNotification({
                fullName: user.fullName || '',
                email: user.email,
                city: 'N/A',
                role: 'INFLUENCEUR'
            })
        } catch (e) {
            console.error('Telegram notification error:', e)
        }

        // 2. Créer le coupon affilié relié à l'utilisateur
        await prisma.coupon.create({
            data: {
                code: validated.code,
                discount: validated.discount,
                type: validated.type,
                affiliateName: validated.affiliateName,
                commission: validated.commission,
                isAffiliate: true,
                isActive: validated.isActive,
                userId: user.id
            }
        })

        revalidatePath('/admin/affiliates')
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Cet email ou code coupon est déjà utilisé.' }
        }
        return { success: false, error: error.message || 'Erreur lors de la création' }
    }
}

export async function updateAffiliate(id: string, data: Partial<z.infer<typeof AffiliateSchema>>) {
    try {
        await verifyAdmin()
        
        await prisma.coupon.update({
            where: { id },
            data
        })

        revalidatePath('/admin/affiliates')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la mise à jour' }
    }
}

export async function deleteAffiliate(id: string) {
    try {
        await verifyAdmin()
        await prisma.coupon.delete({ where: { id, isAffiliate: true } })
        revalidatePath('/admin/affiliates')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Erreur lors de la suppression' }
    }
}

export async function getInfluencerDashboardData() {
    try {
        const userId = await getAdminUser()
        if (!userId) throw new Error('Non authentifié')

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || user.role !== 'INFLUENCER') throw new Error('Accès réservé aux influenceurs')

        const coupons = await prisma.coupon.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        const orders = await prisma.order.findMany({
            where: {
                couponCode: { in: coupons.map(c => c.code) },
                status: { notIn: ['CANCELLED', 'FAILED', 'RETURNED'] }
            },
            include: { 
                items: {
                    include: {
                        product: { select: { title: true } },
                        pack: { select: { name: true } },
                        gift: { select: { name: true } }
                    }
                } 
            },
            orderBy: { createdAt: 'desc' }
        })

        const stats = coupons.map(coupon => {
            const coupOrders = orders.filter(o => o.couponCode === coupon.code)
            const revenue = coupOrders.reduce((sum, o) => sum + o.total, 0)
            const totalItems = coupOrders.reduce((s, ord) => s + ord.items.reduce((is, itm) => is + itm.quantity, 0), 0)

            let commission = 0
            if (coupon.commission) {
                if (coupon.type === 'PERCENTAGE') {
                    commission = (revenue * (coupon.commission || 0)) / 100
                } else {
                    commission = totalItems * (coupon.commission || 0)
                }
            }

            return {
                ...coupon,
                ordersCount: coupOrders.length,
                revenue,
                itemsCount: totalItems,
                commission
            }
        })

        return { user, stats, orders }
    } catch (error) {
        return null
    }
}
