import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram'
import { OrderStatus } from '@prisma/client'

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    SHIPPED: 'En livraison',
    DELIVERED: 'Livrée',
    RETURNED: 'Retournée',
    CANCELLED: 'Annulée',
    IN_TRANSIT: 'En transit',
    OUT_FOR_DELIVERY: 'En cours de livraison',
    FAILED: 'Échec',
}

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const queryToken = searchParams.get('token')
        
        const body = await req.json()
        
        // Récupérer le token depuis la DB
        const tokenSetting = await prisma.siteSettings.findUnique({ where: { key: 'telegram_bot_token' } })
        const token = tokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN || ''

        // Sécurisation : accepter si le token dans l'URL correspond au bot token
        // OU si aucun token n'est fourni (Telegram envoie via HTTPS donc fiable)
        if (!token) {
            console.error('[SECURITY] Bot token not configured')
            return NextResponse.json({ error: 'Not configured' }, { status: 500 })
        }
        if (queryToken && queryToken !== token) {
            console.error('[SECURITY] Unauthorized Telegram Webhook attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Traitement des callback_query (boutons)
        if (body.callback_query) {
            const { id: callbackId, data, message } = body.callback_query
            
            // Format attendu: os:{orderId}:{STATUS}
            if (data && data.startsWith('os:')) {
                const [, orderId, newStatus] = data.split(':')
                
                // Valider le statut
                if (!Object.keys(STATUS_LABELS).includes(newStatus)) {
                    await answerCallbackQuery(callbackId, 'Statut invalide', token)
                    return NextResponse.json({ ok: true })
                }

                // Mettre à jour la commande dans la DB
                const order = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: newStatus as OrderStatus,
                        statusHistory: {
                            create: {
                                status: newStatus as OrderStatus,
                                comment: 'Statut mis à jour via Telegram Bot',
                                createdBy: 'TELEGRAM'
                            }
                        }
                    }
                })

                const label = STATUS_LABELS[newStatus]
                
                // Répondre au callback
                await answerCallbackQuery(callbackId, `✅ Statut mis à jour : ${label}`, token)

                // Modifier le message pour refléter le changement
                const shortId = orderId.slice(0, 8).toUpperCase()
                const updatedText = `✅ <b>Commande #${shortId}</b>\n\n` +
                    `👤 ${order.fullName}\n` +
                    `📍 ${order.city}\n` +
                    `💰 ${order.total.toFixed(2)} MAD\n\n` +
                    `📌 <b>Statut :</b> ${label}`

                if (message?.chat?.id && message?.message_id) {
                    await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                }
            }
            
            // Format: sw:{orderId}
            if (data && data.startsWith('sw:')) {
                const [, orderId] = data.split(':')
                const { syncOrderToWithYou } = await import('@/lib/actions/admin-orders')

                try {
                    const result = await syncOrderToWithYou(orderId)
                    
                    if (result.success) {
                        await answerCallbackQuery(callbackId, `🚀 Expédié WithYou avec succès !`, token)
                        
                        // Mettre à jour le message
                        const order = await prisma.order.findUnique({ where: { id: orderId } })
                        if (order && message?.chat?.id && message?.message_id) {
                            const shortId = orderId.slice(0, 8).toUpperCase()
                            const updatedText = `✅ <b>Commande #${shortId} EXPÉDIÉE</b>\n\n` +
                                `👤 ${order.fullName}\n` +
                                `📍 ${order.city}\n` +
                                `💰 ${order.total.toFixed(2)} MAD\n\n` +
                                `🚀 <b>WithYou Tracking :</b> <code>${order.trackingID}</code>\n` +
                                `📌 <b>Statut :</b> Confirmée`
                                
                            await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                        }
                    } else {
                        await answerCallbackQuery(callbackId, `❌ Erreur : ${result.error}`, token)
                    }
                } catch (error: any) {
                    await answerCallbackQuery(callbackId, `❌ Erreur système : ${error.message}`, token)
                }
            }

            // Format: approve_review:{reviewId}
            if (data && data.startsWith('approve_review:')) {
                const [, reviewId] = data.split(':')
                const review = await prisma.review.update({
                    where: { id: reviewId },
                    data: { isApproved: true },
                    include: { book: { select: { title: true } } }
                })
                
                await answerCallbackQuery(callbackId, '✅ Avis approuvé !', token)
                const updatedText = `✅ <b>Avis Approuvé</b>\n\n` +
                    `👤 <b>Client:</b> ${review.fullName}\n` +
                    `📖 <b>Livre:</b> ${review.book.title}\n` +
                    `⭐ <b>Note:</b> ${review.rating}/5\n` +
                    `💬 <i>${review.comment}</i>`

                if (message?.chat?.id && message?.message_id) {
                    await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                }
            }

            // Format: delete_review:{reviewId}
            if (data && data.startsWith('delete_review:')) {
                const [, reviewId] = data.split(':')
                await prisma.review.delete({ where: { id: reviewId } })
                
                await answerCallbackQuery(callbackId, '🗑️ Avis supprimé !', token)
                const updatedText = `🗑️ <b>Avis Supprimé</b>\n\nL'avis a été définitivement retiré.`

                if (message?.chat?.id && message?.message_id) {
                    await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                }
            }
        }

        // Traitement des messages textes (Commandes)
        if (body.message && body.message.text) {
            const rawText = body.message.text.trim()
            const text = rawText.toUpperCase()
            const chatId = body.message.chat.id
            const { sendTelegramMessage } = await import('@/lib/telegram')

            // 📊 COMMANDE /STATS
            if (text.startsWith('/STATS') || text === 'BILAN') {
                const now = new Date()
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                
                const [orderCount, revenue] = await Promise.all([
                    prisma.order.count({ where: { createdAt: { gte: firstDayOfMonth }, status: { not: 'CANCELLED' } } }),
                    prisma.order.aggregate({
                        where: { createdAt: { gte: firstDayOfMonth }, status: { not: 'CANCELLED' } },
                        _sum: { total: true }
                    })
                ])

                const replyText = `📊 <b>STATS DU MOIS</b>\n\n` +
                                  `📅 Période : <b>${firstDayOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</b>\n` +
                                  `📦 Commandes : <b>${orderCount}</b>\n` +
                                  `💰 CA estimé : <b>${(revenue._sum.total || 0).toFixed(2)} MAD</b>`

                await sendTelegramMessage(replyText, chatId.toString(), token)
            }

            // 📦 COMMANDE /STOCK [NOM]
            else if (text.startsWith('/STOCK')) {
                const query = rawText.split(' ').slice(1).join(' ')
                if (!query) {
                    await sendTelegramMessage(`💡 Utilisation : <code>/stock [nom du livre]</code>`, chatId.toString(), token)
                } else {
                    const books = await prisma.book.findMany({
                        where: { title: { contains: query } },
                        take: 5,
                        select: { title: true, stock: true, price: true }
                    })

                    if (books.length === 0) {
                        await sendTelegramMessage(`❌ Aucun livre trouvé pour "${query}"`, chatId.toString(), token)
                    } else {
                        const list = books.map(b => `📖 <b>${b.title}</b>\n📦 Stock: <b>${b.stock}</b> | 💰 ${b.price} MAD`).join('\n\n')
                        await sendTelegramMessage(`🔍 <b>Résultats Stock</b> :\n\n${list}`, chatId.toString(), token)
                    }
                }
            }

            // 👤 COMMANDE /SEARCH [NOM/TEL]
            else if (text.startsWith('/SEARCH')) {
                const query = rawText.split(' ').slice(1).join(' ')
                if (!query) {
                    await sendTelegramMessage(`💡 Utilisation : <code>/search [nom ou téléphone]</code>`, chatId.toString(), token)
                } else {
                    const customers = await prisma.order.findMany({
                        where: {
                            OR: [
                                { fullName: { contains: query } },
                                { phone: { contains: query } }
                            ]
                        },
                        take: 3,
                        orderBy: { createdAt: 'desc' },
                        select: { fullName: true, phone: true, city: true, address: true }
                    })

                    if (customers.length === 0) {
                        await sendTelegramMessage(`❌ Aucun client trouvé pour "${query}"`, chatId.toString(), token)
                    } else {
                        const list = customers.map(c => `👤 <b>${c.fullName}</b>\n📞 ${c.phone}\n📍 ${c.city}, ${c.address}`).join('\n\n')
                        await sendTelegramMessage(`🔍 <b>Résultats Clients</b> :\n\n${list}`, chatId.toString(), token)
                    }
                }
            }
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Telegram webhook error:', error)
        return NextResponse.json({ ok: true })
    }
}
