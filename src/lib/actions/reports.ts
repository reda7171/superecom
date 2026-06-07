'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './auth'

// Créer un signalement
export async function createReport(data: {
    targetUserId?: string
    targetProductId?: string
    reason: string
    details?: string
}) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Vous devez être connecté pour signaler." }

    if (!data.targetUserId && !data.targetProductId) {
        return { success: false, error: "Cible du signalement manquante" }
    }

    try {
        await (prisma as any).report.create({
            data: {
                reporterId: user.id,
                targetUserId: data.targetUserId,
                targetProductId: data.targetProductId,
                reason: data.reason,
                details: data.details
            }
        })
        return { success: true, message: "Signalement envoyé. Merci de votre vigilance." }
    } catch (error) {
        console.error("Erreur signalement:", error)
        return { success: false, error: "Erreur lors de l'envoi du signalement." }
    }
}

// Récupérer les signalements (Admin)
export async function getReports(status = 'PENDING') {
    try {
        // Support either main admin or community admin
        const communityAdmin = await getCommunityUser()
        const isAuth = (communityAdmin && communityAdmin.role === 'ADMIN') || (await verifyAdmin().then(() => true).catch(() => false))

        if (!isAuth) return []

        const where: any = {}
        if (status !== 'ALL') {
            where.status = status
        }

        const reports = await (prisma as any).report.findMany({
            where,
            include: {
                reporter: {
                    select: { id: true, fullName: true, email: true, image: true }
                },
                targetUser: {
                    select: { id: true, fullName: true, email: true, image: true }
                },
                targetProduct: {
                    select: { id: true, title: true, image: true, ownerId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return reports
    } catch (error) {
        console.error("Erreur récupération signalements:", error)
        return []
    }
}

// Mettre à jour le statut d'un signalement (Admin)
export async function updateReportStatus(reportId: string, status: string) {
    try {
        const communityAdmin = await getCommunityUser()
        const isAuth = (communityAdmin && communityAdmin.role === 'ADMIN') || (await verifyAdmin().then(() => true).catch(() => false))

        if (!isAuth) return { success: false, error: "Non autorisé" }

        await (prisma as any).report.update({
            where: { id: reportId },
            data: { status }
        })
        revalidatePath('/admin/reports')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur mise à jour statut" }
    }
}
