'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'

interface CreateNotificationParams {
    userId: string
    type: 'EXCHANGE_REQUEST' | 'EXCHANGE_ACCEPTED' | 'EXCHANGE_REJECTED' | 'NEW_MESSAGE' | 'EXCHANGE_COMPLETED' | 'RATING_RECEIVED'
    title: string
    message: string
    link?: string
}

// Créer une notification
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link
            }
        })

        revalidatePath('/community')
        return { success: true, notification }
    } catch (error) {
        return { success: false, error: "Erreur lors de la création de la notification" }
    }
}

// Récupérer les notifications de l'utilisateur
export async function getUserNotifications() {
    const user = await getCommunityUser()
    if (!user) return null

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return notifications
    } catch (error) {
        return []
    }
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false }

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: user.id
            },
            data: {
                read: true
            }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

// Marquer toutes les notifications comme lues
export async function markAllNotificationsAsRead() {
    const user = await getCommunityUser()
    if (!user) return { success: false }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: user.id,
                read: false
            },
            data: {
                read: true
            }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

// Compter les notifications non lues
export async function getUnreadNotificationsCount() {
    const user = await getCommunityUser()
    if (!user) return 0

    try {
        const count = await prisma.notification.count({
            where: {
                userId: user.id,
                read: false
            }
        })

        return count
    } catch (error) {
        return 0
    }
}

// Supprimer une notification
export async function deleteNotification(notificationId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false }

    try {
        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: user.id
            }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
