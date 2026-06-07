'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './community-notifications'
import { getTranslations } from 'next-intl/server'

// Créer ou récupérer un chat pour un échange
export async function getOrCreateChat(exchangeId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non authentifié" }

    try {
        // Vérifier que l'utilisateur fait partie de l'échange
        const exchange = await prisma.exchange.findUnique({
            where: { id: exchangeId },
            include: {
                chat: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'asc' },
                            include: { sender: { select: { id: true, fullName: true, image: true } } }
                        }
                    }
                },
                productRequested: true
            }
        })

        if (!exchange) {
            return { success: false, error: "Échange introuvable" }
        }

        if (exchange.requesterId !== user.id && exchange.responderId !== user.id) {
            return { success: false, error: "Non autorisé" }
        }

        // Si le chat existe déjà, le retourner
        if (exchange.chat) {
            return { success: true, chat: { ...exchange.chat, exchange } }
        }

        // Créer un nouveau chat
        const chat = await prisma.chat.create({
            data: {
                exchangeId: exchangeId
            },
            include: {
                exchange: {
                    include: {
                        productRequested: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                fullName: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })

        return { success: true, chat }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la création du chat" }
    }
}

// Envoyer un message
export async function sendMessage(chatId: string, content: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false, error: "Non authentifié" }

    if (!content.trim()) {
        return { success: false, error: "Le message ne peut pas être vide" }
    }

    try {
        const t = await getTranslations('Notifications')
        // Vérifier que l'utilisateur a accès au chat
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { exchange: true }
        })

        if (!chat) {
            return { success: false, error: "Chat introuvable" }
        }

        if (chat.exchange.requesterId !== user.id && chat.exchange.responderId !== user.id) {
            return { success: false, error: "Non autorisé" }
        }

        // Créer le message
        const message = await prisma.message.create({
            data: {
                chatId,
                senderId: user.id,
                content: content.trim()
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        image: true
                    }
                }
            }
        })

        // Notifier l'autre utilisateur
        const recipientId = chat.exchange.requesterId === user.id
            ? chat.exchange.responderId
            : chat.exchange.requesterId

        await createNotification({
            userId: recipientId,
            type: 'NEW_MESSAGE',
            title: t('NewMessage'),
            message: t('NewMessageDesc', { user: user.fullName || 'Utilisateur' }),
            link: `/community/exchanges/${chat.exchange.id}/chat`
        })

        revalidatePath(`/community/exchanges/${chat.exchange.id}/chat`)
        return { success: true, message }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de l'envoi du message" }
    }
}

// Marquer les messages comme lus
export async function markMessagesAsRead(chatId: string) {
    const user = await getCommunityUser()
    if (!user) return { success: false }

    try {
        await prisma.message.updateMany({
            where: {
                chatId,
                senderId: { not: user.id },
                read: false
            },
            data: {
                read: true
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

// Récupérer les messages d'un chat
export async function getChatMessages(chatId: string) {
    const user = await getCommunityUser()
    if (!user) return null

    try {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                exchange: true,
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                fullName: true,
                                image: true
                            }
                        }
                    }
                }
            }
        })

        if (!chat) return null

        // Vérifier l'accès
        if (chat.exchange.requesterId !== user.id && chat.exchange.responderId !== user.id) {
            return null
        }

        return chat
    } catch (error) {
        return null
    }
}
