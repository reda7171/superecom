'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './auth'
import { createAuditLog } from './audit'

export async function getCategoryConfigs() {
    try {
        await verifyAdmin()
        return (prisma as any).categoryConfig.findMany()
    } catch (error) {
        return []
    }
}

export async function updateCategoryBadge(name: string, badge: string | null, expiresAt: Date | null = null, color: string | null = null) {
    await verifyAdmin()
    await (prisma as any).categoryConfig.upsert({
        where: { name },
        update: { badge, badgeExpiresAt: expiresAt, badgeColor: color },
        create: { name, badge, badgeExpiresAt: expiresAt, badgeColor: color }
    })

    await createAuditLog({
        action: 'UPDATE_BADGE',
        entity: 'CATEGORY',
        details: `Badge ${badge} ajouté à la catégorie ${name}`
    })

    revalidatePath('/')
}

export async function getAllCategories() {
    // Publicly accessible for filters
    const categories = await prisma.book.groupBy({
        by: ['category'],
        where: { category: { not: null } }
    })
    return categories.map(c => c.category as string)
}

export async function toggleCategoryPin(name: string) {
    await verifyAdmin()
    const config = await (prisma as any).categoryConfig.findUnique({ where: { name } })
    await (prisma as any).categoryConfig.upsert({
        where: { name },
        update: { isPinned: !config?.isPinned },
        create: { name, isPinned: true }
    })
    revalidatePath('/')
}
