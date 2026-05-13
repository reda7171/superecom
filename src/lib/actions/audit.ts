'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export type AuditEntity = 'BOOK' | 'PACK' | 'ORDER' | 'COUPON' | 'CATEGORY' | 'REVIEW' | 'USER' | 'AUTH' | 'AUTHOR_PROFILE'

/**
 * Créer une entrée dans le journal d'audit
 */
export async function createAuditLog(data: {
    action: string
    entity: AuditEntity
    entityId?: string
    details?: string
}) {
    try {
        const cookieStore = await cookies()
        const adminEmail = cookieStore.get('admin-email')?.value || 'SYSTEM'

        await (prisma as any).auditLog.create({
            data: {
                adminId: adminEmail,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                details: data.details,
            }
        })
    } catch (error) {
        console.error('Erreur lors de la création du log d\'audit:', error)
    }
}

/**
 * Récupérer les derniers logs d'audit
 */
export async function getAuditLogs(limit = 50) {
    try {
        return await (prisma as any).auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error('Erreur récupération logs d\'audit:', error)
        return []
    }
}
