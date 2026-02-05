'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCategoryConfigs() {
    return (prisma as any).categoryConfig.findMany()
}

export async function updateCategoryBadge(name: string, badge: string | null, expiresAt: Date | null = null, color: string | null = null) {
    await (prisma as any).categoryConfig.upsert({
        where: { name },
        update: { badge, badgeExpiresAt: expiresAt, badgeColor: color },
        create: { name, badge, badgeExpiresAt: expiresAt, badgeColor: color }
    })
    revalidatePath('/')
}

export async function getAllCategories() {
    const categories = await prisma.book.groupBy({
        by: ['category'],
        where: { category: { not: null } }
    })
    return categories.map(c => c.category as string)
}

export async function toggleCategoryPin(name: string) {
    const config = await (prisma as any).categoryConfig.findUnique({ where: { name } })
    await (prisma as any).categoryConfig.upsert({
        where: { name },
        update: { isPinned: !config?.isPinned },
        create: { name, isPinned: true }
    })
    revalidatePath('/')
}
