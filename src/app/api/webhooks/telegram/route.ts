import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { answerCallbackQuery, editTelegramMessage, sendTelegramMessage, sendTelegramPhoto, sendTelegramMediaGroup } from '@/lib/telegram'
import { OrderStatus } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

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
    let currentCallbackId: string | null = null
    let currentToken: string | null = null

    try {
        const { searchParams } = new URL(req.url)
        const queryToken = searchParams.get('token')
        
        const body = await req.json()
        console.log('[TELEGRAM WEBHOOK] Incoming Body:', JSON.stringify(body))
        
        // Récupérer le token depuis la DB
        const tokenSetting = await prisma.siteSettings.findUnique({ where: { key: 'telegram_bot_token' } })
        const token = tokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN || ''
        currentToken = token

        if (!token) {
            console.error('[SECURITY] Bot token not configured')
            return NextResponse.json({ error: 'Not configured' }, { status: 500 })
        }

        if (queryToken && queryToken !== token) {
            console.error('[SECURITY] Unauthorized Telegram Webhook attempt: Token mismatch')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Traitement des callback_query (boutons)
        if (body.callback_query) {
            const { id: callbackId, data, message } = body.callback_query
            currentCallbackId = callbackId
            const { escapeHtml } = await import('@/lib/telegram')
            
            console.log(`[TELEGRAM CALLBACK] Received ID: ${callbackId}, Data: ${data}`)

            // Format attendu: os:{orderId}:{STATUS}
            if (data && data.startsWith('os:')) {
                const parts = data.split(':')
                const orderId = parts[1]
                const newStatus = parts[2]
                
                console.log(`[TELEGRAM STATUS] Updating order ${orderId} to status: ${newStatus}`)

                if (!STATUS_LABELS[newStatus]) {
                    console.warn(`[TELEGRAM] Status label not found for: ${newStatus}`)
                    await answerCallbackQuery(callbackId, '❌ Statut invalide', token)
                    return NextResponse.json({ ok: true })
                }

                try {
                    const orderToUpdate = await prisma.order.findUnique({
                        where: { id: orderId },
                        include: { items: true }
                    })
                    
                    if (!orderToUpdate) throw new Error('Commande introuvable')

                    const prevStatus = orderToUpdate.status
                    const isNowReturned = newStatus === 'RETURNED' || newStatus === 'CANCELLED'
                    const alreadyRestored = ['CANCELLED', 'RETURNED'].includes(prevStatus)

                    const order = await prisma.$transaction(async (tx) => {
                        const updated = await tx.order.update({
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
                        
                        if (isNowReturned && !alreadyRestored) {
                            for (const item of orderToUpdate.items) {
                                if (item.type === 'BOOK' && item.bookId) {
                                    await tx.book.update({
                                        where: { id: item.bookId },
                                        data: { stock: { increment: item.quantity } }
                                    })
                                }
                            }
                        }
                        
                        return updated
                    })

                    console.log(`[TELEGRAM] Order ${orderId} successfully updated to ${newStatus}`)
                    const label = STATUS_LABELS[newStatus]
                    await answerCallbackQuery(callbackId, `✅ Statut : ${label}`, token)

                    const shortId = orderId.slice(0, 8).toUpperCase()
                    const updatedText = `✅ <b>Commande #${shortId}</b>\n\n` +
                        `👤 ${escapeHtml(order.fullName)}\n` +
                        `📍 ${escapeHtml(order.city)}\n` +
                        `💰 ${order.total.toFixed(2)} MAD\n\n` +
                        `📌 <b>Statut :</b> ${label}`

                    if (message?.chat?.id && message?.message_id) {
                        await editTelegramMessage(message.chat.id, message.message_id, updatedText, token, message.reply_markup)
                    }
                } catch (error) {
                    console.error('[TELEGRAM] Database error during status update:', error)
                    await answerCallbackQuery(callbackId, '❌ Erreur : Commande introuvable ou erreur DB', token)
                }
            }
            
            // Format: sw:{orderId}
            else if (data && data.startsWith('sw:')) {
                const [, orderId] = data.split(':')
                const { syncOrderToWithYou } = await import('@/lib/actions/admin-orders')

                try {
                    const result = await syncOrderToWithYou(orderId)
                    if (result.success) {
                        await answerCallbackQuery(callbackId, `🚀 Expédié WithYou avec succès !`, token)
                        const order = await prisma.order.findUnique({ where: { id: orderId } })
                        if (order && message?.chat?.id && message?.message_id) {
                            const shortId = orderId.slice(0, 8).toUpperCase()
                            const updatedText = `✅ <b>Commande #${shortId} EXPÉDIÉE</b>\n\n` +
                                `👤 ${escapeHtml(order.fullName)}\n` +
                                `📍 ${escapeHtml(order.city)}\n` +
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
            
            // Format: promo_flash:{bookId}
            else if (data && data.startsWith('promo_flash:')) {
                const [, bookId] = data.split(':')
                try {
                    const book = await prisma.book.findUnique({ where: { id: bookId } })
                    if (!book) throw new Error('Livre introuvable')
                    
                    const newPrice = Math.round(book.price * 0.9) // -10%
                    await prisma.book.update({
                        where: { id: bookId },
                        data: { price: newPrice }
                    })

                    await answerCallbackQuery(callbackId, `🏷️ Promo appliquée : ${newPrice} MAD`, token)
                    if (message?.chat?.id && message?.message_id) {
                        const updatedText = `🏷️ <b>PROMO FLASH APPLIQUÉE (-10%)</b>\n\n` +
                                            `📖 <b>Livre:</b> ${escapeHtml(book.title)}\n` +
                                            `💰 <b>Ancien prix:</b> ${book.price} MAD\n` +
                                            `🔥 <b>Nouveau prix:</b> ${newPrice} MAD\n` +
                                            `📦 <b>Stock:</b> ${book.stock}`
                        await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                    }
                } catch (error: any) {
                    await answerCallbackQuery(callbackId, `❌ Erreur : ${error.message}`, token)
                }
            }

            // Format: restock:{bookId}:{amount}
            else if (data && data.startsWith('restock:')) {
                const [, bookId, amount] = data.split(':')
                try {
                    const book = await prisma.book.update({
                        where: { id: bookId },
                        data: { stock: { increment: parseInt(amount) } }
                    })
                    await answerCallbackQuery(callbackId, `📦 Stock mis à jour : ${book.stock}`, token)
                    if (message?.chat?.id && message?.message_id) {
                        const updatedText = `✅ <b>RÉAPPROVISIONNEMENT EFFECTUÉ</b>\n\n` +
                                            `📖 <b>Livre:</b> ${escapeHtml(book.title)}\n` +
                                            `📦 <b>Nouveau stock:</b> <b>${book.stock}</b>`
                        await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                    }
                } catch (error: any) {
                    await answerCallbackQuery(callbackId, `❌ Erreur : ${error.message}`, token)
                }
            }

            // Format: hide_book:{bookId}
            else if (data && data.startsWith('hide_book:')) {
                const [, bookId] = data.split(':')
                try {
                    const book = await prisma.book.update({
                        where: { id: bookId },
                        data: { active: false }
                    })
                    await answerCallbackQuery(callbackId, `🚫 Livre masqué du site`, token)
                    if (message?.chat?.id && message?.message_id) {
                        const updatedText = `🚫 <b>LIVRE MASQUÉ DU SITE</b>\n\n` +
                                            `📖 <b>Livre:</b> ${escapeHtml(book.title)}\n` +
                                            `📌 Statut: <b>INACTIF</b>`
                        await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                    }
                } catch (error: any) {
                    await answerCallbackQuery(callbackId, `❌ Erreur : ${error.message}`, token)
                }
            }
            
            // Format: gen_creative:{orderId}
            else if (data && data.startsWith('gen_creative:')) {
                const [, orderId] = data.split(':')
                try {
                    const order = await prisma.order.findUnique({
                        where: { id: orderId },
                        include: { items: { include: { book: true, pack: true } } }
                    })
                    
                    if (!order || order.items.length === 0) throw new Error('Commande ou articles introuvables')
                    
                    const firstItem = order.items[0]
                    const itemId = firstItem.bookId || firstItem.packId
                    const itemType = firstItem.bookId ? 'BOOK' : 'PACK'

                    const replyMarkup = {
                        inline_keyboard: [
                            [
                                { text: '📸 Instagram', callback_data: `pub_creative:${itemId}:${itemType}:instagram` },
                                { text: '📘 Facebook', callback_data: `pub_creative:${itemId}:${itemType}:facebook` }
                            ],
                            [
                                { text: '🎵 TikTok', callback_data: `pub_creative:${itemId}:${itemType}:tiktok` },
                                { text: '✈️ Telegram', callback_data: `pub_creative:${itemId}:${itemType}:telegram` }
                            ]
                        ]
                    }

                    await answerCallbackQuery(callbackId, `📱 Choisissez la plateforme`, token)
                    if (message?.chat?.id && message?.message_id) {
                        await editTelegramMessage(message.chat.id, message.message_id, `📱 <b>Destination du Visuel</b>\n\nSur quelle plateforme souhaitez-vous publier ce visuel ?`, token, replyMarkup)
                    }
                } catch (error: any) {
                    await answerCallbackQuery(callbackId, `❌ Erreur : ${error.message}`, token)
                }
            }

            // Format: pub_creative:{id}:{type}:{platform}
            else if (data && data.startsWith('pub_creative:')) {
                const [, itemId, itemType, platform] = data.split(':')
                try {
                    const instagramId = (await prisma.siteSettings.findUnique({ where: { key: 'marketing_instagram_id' } }))?.value
                    const facebookPageId = (await prisma.siteSettings.findUnique({ where: { key: 'marketing_facebook_page_id' } }))?.value

                    const payload = {
                        bookId: itemType === 'BOOK' ? itemId : null,
                        packId: itemType === 'PACK' ? itemId : null,
                        format: 'story',
                        platform: platform,
                        instagram_account_id: instagramId,
                        facebook_page_id: facebookPageId,
                        source: 'telegram-bot-action'
                    }

                    const n8nWebhookUrl = (await prisma.siteSettings.findUnique({ where: { key: 'n8n_webhook_url' } }))?.value || process.env.N8N_WEBHOOK_URL
                    if (!n8nWebhookUrl) throw new Error('n8n non configuré')

                    await answerCallbackQuery(callbackId, `🚀 Publication ${platform} lancée...`, token)

                    fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).catch(console.error)

                    if (message?.chat?.id && message?.message_id) {
                        await editTelegramMessage(message.chat.id, message.message_id, `⏳ <b>Génération en cours...</b>\n\nVotre visuel pour <b>${platform.toUpperCase()}</b> est en cours de création via n8n.`, token)
                    }
                } catch (error: any) {
                    await answerCallbackQuery(callbackId, `❌ Erreur : ${error.message}`, token)
                }
            }

            // Format: prep_creative:{itemId}:{itemType}
            else if (data && data.startsWith('prep_creative:')) {
                const [, itemId, itemType] = data.split(':')
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            { text: '📸 Instagram', callback_data: `pub_creative:${itemId}:${itemType}:instagram` },
                            { text: '📘 Facebook', callback_data: `pub_creative:${itemId}:${itemType}:facebook` }
                        ],
                        [
                            { text: '🎵 TikTok', callback_data: `pub_creative:${itemId}:${itemType}:tiktok` },
                            { text: '✈️ Telegram', callback_data: `pub_creative:${itemId}:${itemType}:telegram` }
                        ]
                    ]
                }
                if (message?.chat?.id && message?.message_id) {
                    await editTelegramMessage(message.chat.id, message.message_id, `📱 <b>Destination du Visuel</b>\n\nSur quelle plateforme souhaitez-vous publier ?`, token, replyMarkup)
                }
            }
            
            // Format: approve_review:{reviewId}
            else if (data && data.startsWith('approve_review:')) {
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
            else if (data && data.startsWith('delete_review:')) {
                const [, reviewId] = data.split(':')
                await prisma.review.delete({ where: { id: reviewId } })
                
                await answerCallbackQuery(callbackId, '🗑️ Avis supprimé !', token)
                const updatedText = `🗑️ <b>Avis Supprimé</b>\n\nL'avis a été définitivement retiré.`

                if (message?.chat?.id && message?.message_id) {
                    await editTelegramMessage(message.chat.id, message.message_id, updatedText, token)
                }
            }
            
            // Format: stats:{period}:{dateParam}
            else if (data && data.startsWith('stats:')) {
                const parts = data.split(':')
                const period = parts[1]
                const dateParam = parts[2]
                
                const now = new Date()
                let start = new Date(now.setHours(0, 0, 0, 0))
                let end = new Date(now.setHours(23, 59, 59, 999))
                let label = "Aujourd'hui"

                if (period === 'yesterday') {
                    start = new Date(now.setDate(now.getDate() - 1))
                    start.setHours(0,0,0,0)
                    end = new Date(start)
                    end.setHours(23,59,59,999)
                    label = "Hier"
                } else if (period === 'month') {
                    start = new Date(now.getFullYear(), now.getMonth(), 1)
                    label = "Ce Mois"
                } else if (period === 'date' && dateParam) {
                    start = new Date(dateParam)
                    start.setHours(0,0,0,0)
                    end = new Date(dateParam)
                    end.setHours(23,59,59,999)
                    label = start.toLocaleDateString('fr-FR')
                }

                if (period === 'top5') {
                    const topBooks = await prisma.orderItem.groupBy({
                        by: ['bookId'],
                        where: { bookId: { not: null }, order: { status: { not: 'CANCELLED' } } },
                        _count: { bookId: true },
                        orderBy: { _count: { bookId: 'desc' } },
                        take: 5
                    })

                    const books = await Promise.all(topBooks.map(async (item) => {
                        const book = await prisma.book.findUnique({ where: { id: item.bookId! }, select: { title: true } })
                        return `🏆 <b>${book?.title || 'Livre inconnu'}</b> : ${item._count.bookId} ventes`
                    }))

                    const text = `🥇 <b>TOP 5 DES VENTES</b>\n\n${books.join('\n')}`
                    await answerCallbackQuery(callbackId, '🏆 Top 5 généré', token)
                    await sendTelegramMessage(text, message?.chat?.id.toString(), token)
                } else {
                    // Récupérer les paramètres pour savoir quoi afficher
                    const showVisitors = (await prisma.siteSettings.findUnique({ where: { key: 'telegram_stats_visitors' } }))?.value === 'true'
                    const showRegistrations = (await prisma.siteSettings.findUnique({ where: { key: 'telegram_stats_registrations' } }))?.value === 'true'
                    const showViews = (await prisma.siteSettings.findUnique({ where: { key: 'telegram_stats_top_views' } }))?.value === 'true'

                    const [count, revenue, visitors, registrations, expenses, statusCounts, abandoned, soldItems, lowStockCount, blogViews, pendingComments, publishedPosts] = await Promise.all([
                        prisma.order.count({ where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } } }),
                        prisma.order.aggregate({
                            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
                            _sum: { total: true, discount: true }
                        }),
                        showVisitors ? prisma.pageView.groupBy({
                            by: ['sessionId'],
                            where: { createdAt: { gte: start, lte: end } }
                        }).then(res => res.length) : Promise.resolve(0),
                        showRegistrations ? prisma.user.count({
                            where: { createdAt: { gte: start, lte: end }, role: 'USER' }
                        }) : Promise.resolve(0),
                        prisma.expense.aggregate({
                            where: { date: { gte: start, lte: end } },
                            _sum: { amount: true }
                        }),
                        prisma.order.groupBy({
                            by: ['status'],
                            where: { createdAt: { gte: start, lte: end } },
                            _count: { status: true }
                        }),
                        prisma.abandonedCart.aggregate({
                            where: { createdAt: { gte: start, lte: end }, status: 'PENDING' },
                            _count: { id: true },
                            _sum: { total: true }
                        }),
                        prisma.orderItem.findMany({
                            where: { order: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } } },
                            select: { quantity: true, costPrice: true, book: { select: { category: true } } }
                        }),
                        prisma.book.count({
                            where: { active: true, stock: { lt: 5 } }
                        }),
                        prisma.pageView.count({
                            where: { createdAt: { gte: start, lte: end }, url: { contains: '/blog/' } }
                        }),
                        prisma.comment.count({
                            where: { isApproved: false }
                        }),
                        prisma.post.count({
                            where: { published: true }
                        })
                    ])

                    let totalQuantity = 0
                    let totalCogs = 0
                    const categoryStats: Record<string, number> = {}

                    soldItems.forEach(item => {
                        totalQuantity += item.quantity
                        totalCogs += item.quantity * (item.costPrice || 0)
                        if (item.book?.category) {
                            const cat = item.book.category
                            categoryStats[cat] = (categoryStats[cat] || 0) + item.quantity
                        }
                    })

                    const topCategories = Object.entries(categoryStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([cat, qty]) => `${escapeHtml(cat)}: ${qty}`)
                        .join(' | ') || 'Aucune'

                    let totalOrdersAll = 0
                    let pendingCount = 0
                    let deliveredCount = 0
                    let cancelledCount = 0
                    let returnedCount = 0

                    statusCounts.forEach(s => {
                        totalOrdersAll += s._count.status
                        if (s.status === 'PENDING') pendingCount = s._count.status
                        if (s.status === 'DELIVERED') deliveredCount = s._count.status
                        if (s.status === 'CANCELLED') cancelledCount = s._count.status
                        if (s.status === 'RETURNED') returnedCount = s._count.status
                    })

                    const deliveryResolved = deliveredCount + returnedCount
                    const deliverySuccessRate = deliveryResolved > 0 ? ((deliveredCount / deliveryResolved) * 100).toFixed(1) : '0.0'

                    const abandonedCount = abandoned._count.id || 0
                    const abandonedValue = abandoned._sum.total || 0
                    const totalDiscounts = revenue._sum.discount || 0

                    let jumiaCount = 0
                    let jumiaRevenue = 0
                    try {
                        const { JumiaAPI } = await import('@/lib/jumia-api')
                        const jumia = await JumiaAPI.getInstance()
                        if (jumia) {
                            const response = await jumia.getOrders(100, 0)
                            const jumiaOrders = response?.orders || response?.data?.orders || []
                            
                            const filtered = jumiaOrders.filter((o: any) => {
                                const createdAt = o.createdAt || o.CreatedAt
                                if (!createdAt) return false
                                const d = new Date(createdAt)
                                const status = o.status || o.Status || ''
                                return d >= start && d <= end && status !== 'canceled' && status !== 'CANCELLED'
                            })
                            
                            jumiaCount = filtered.length
                            jumiaRevenue = filtered.reduce((sum: number, o: any) => {
                                const price = Number(o.totalAmountLocal?.value || o.Price || o.GrandTotal || 0)
                                return sum + price
                            }, 0)
                        }
                    } catch (e) {
                        console.error('Erreur stats Jumia:', e)
                    }

                    const caSite = revenue._sum.total || 0
                    const aov = count > 0 ? (caSite / count).toFixed(2) : '0.00'
                    const totalExpenses = expenses._sum.amount || 0
                    const margin = caSite - totalCogs - totalExpenses
                    const conversionRate = (showVisitors && visitors > 0) ? ((count / visitors) * 100).toFixed(2) : '0.00'

                    let text = `📊 <b>RAPPORT : ${label.toUpperCase()}</b>\n\n` +
                               `📦 Commandes : <b>${count}</b>\n` +
                               `🛒 Articles : <b>${totalQuantity}</b>\n` +
                               `💰 CA Site : <b>${caSite.toFixed(2)} MAD</b>\n` +
                               `📈 Panier Moyen : <b>${aov} MAD</b>\n` +
                               `💸 Dépenses : <b>${totalExpenses.toFixed(2)} MAD</b>\n` +
                               `💎 Bénéfice Est. : <b>${margin.toFixed(2)} MAD</b>\n` +
                               `🎁 Remises Accordées : <b>${totalDiscounts.toFixed(2)} MAD</b>\n` +
                               `🛒 Paniers Abandonnés : <b>${abandonedCount} (${abandonedValue.toFixed(2)} MAD)</b>\n\n` +
                               `📚 <b>Top Catégories :</b> ${topCategories}`
                    
                    if (totalOrdersAll > 0) {
                        text += `\n\n📉 <b>STATUTS & LIVRAISONS</b>\n` +
                                `⏳ En Attente (PENDING) : <b>${pendingCount}</b>\n` +
                                `✅ Livrées : <b>${deliveredCount}</b>\n` +
                                `🔄 Retournées : <b>${returnedCount}</b>\n` +
                                `❌ Annulées : <b>${cancelledCount}</b>\n` +
                                `🎯 Taux Succès Livraison : <b>${deliverySuccessRate}%</b>`
                    }

                    text += `\n\n🟠 <b>JUMIA</b>\n` +
                            `📦 Commandes : <b>${jumiaCount}</b>\n` +
                            `💰 CA Jumia : <b>${jumiaRevenue.toFixed(2)} MAD</b>`
                    
                    text += `\n\n⚠️ <b>ALERTES</b>\n` +
                            `📉 Livres en stock faible (<5) : <b>${lowStockCount}</b>`

                    if (showVisitors) text += `\n\n👥 Visiteurs Uniques : <b>${visitors}</b>\n⚡ Taux de conversion : <b>${conversionRate}%</b>`
                    if (showRegistrations) text += `\n👤 Nouvelles Inscriptions : <b>${registrations}</b>`

                    text += `\n\n📝 <b>BLOG</b>\n` +
                            `📖 Vues d'Articles : <b>${blogViews}</b>\n` +
                            `💬 Commentaires en attente : <b>${pendingComments}</b>\n` +
                            `📝 Articles Publiés : <b>${publishedPosts}</b>`

                    if (showViews) {
                        const topViews = await prisma.pageView.groupBy({
                            by: ['url'],
                            where: { 
                                createdAt: { gte: start, lte: end },
                                url: { contains: '/books/' }
                            },
                            _count: { url: true },
                            orderBy: { _count: { url: 'desc' } },
                            take: 3
                        })
                        
                        if (topViews.length > 0) {
                            text += `\n\n👀 <b>LIVRES LES PLUS CONSULTÉS :</b>`
                            for (const view of topViews) {
                                // Extraire le titre du livre de l'URL si possible ou juste l'URL
                                const bookId = view.url.split('/').pop()?.split('?')[0]
                                if (bookId && bookId.length > 20) {
                                    const book = await prisma.book.findUnique({ where: { id: bookId }, select: { title: true } })
                                    text += `\n• ${escapeHtml(book?.title || 'Livre')} (<b>${view._count.url}</b> vues)`
                                }
                            }
                        }
                    }
                    
                    await answerCallbackQuery(callbackId, `Stats ${label} envoyées`, token)
                    await sendTelegramMessage(text, message?.chat?.id.toString(), token)
                }
            }
            
            // Sécurité : toujours répondre pour arrêter le chargement du bouton
            else {
                await answerCallbackQuery(callbackId, 'Action reçue', token)
            }
        }

        // Traitement des messages textes (Commandes)
        if (body.message && body.message.text) {
            const rawText = body.message.text.trim()
            const text = rawText.toUpperCase()
            const chatId = body.message.chat.id
            console.log(`[TELEGRAM MESSAGE] Received from ${chatId}: ${text}`)

            if (text.startsWith('/BILAN') || text === 'BILAN' || text.startsWith('/STATS')) {
                const parts = rawText.split(' ')
                const query = parts.length > 1 ? parts[1] : null

                if (query) {
                    const dateMatch = query.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/) || query.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/)
                    if (dateMatch) {
                        let y, m, d
                        if (query.match(/^(\d{4})/)) {
                            y = dateMatch[1]; m = dateMatch[2]; d = dateMatch[3]
                        } else {
                            d = dateMatch[1]; m = dateMatch[2]; y = dateMatch[3]
                        }
                        const dateStr = `${y}-${m}-${d}`
                        
                        const replyMarkup = {
                            inline_keyboard: [[
                                { text: `📅 Bilan du ${d}/${m}/${y}`, callback_data: `stats:date:${dateStr}` }
                            ]]
                        }
                        await sendTelegramMessage(`📊 Cliquez ci-dessous pour générer le bilan du ${d}/${m}/${y}`, chatId.toString(), token, replyMarkup)
                        return NextResponse.json({ ok: true })
                    } else {
                        await sendTelegramMessage(`❌ Format de date invalide. Utilisez JJ/MM/AAAA ou JJ-MM-AAAA.`, chatId.toString(), token)
                        return NextResponse.json({ ok: true })
                    }
                }

                const replyText = `📊 <b>Centre de Rapports Riwaya</b>\n\nQue souhaitez-vous consulter ?`
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            { text: "📅 Aujourd'hui", callback_data: 'stats:today' },
                            { text: '🗓️ Hier', callback_data: 'stats:yesterday' }
                        ],
                        [
                            { text: '📅 Ce Mois', callback_data: 'stats:month' }
                        ],
                        [
                            { text: '🏆 Top 5 Livres', callback_data: 'stats:top5' }
                        ]
                    ]
                }
                await sendTelegramMessage(replyText, chatId.toString(), token, replyMarkup)
            }
            else if (text.startsWith('/GENERER') || text === 'GENERER' || text.startsWith('/MARKETING')) {
                console.log(`[TELEGRAM] Command /GENERER received from chat ${chatId}`)
                
                // Envoyer un accusé de réception immédiat
                await sendTelegramMessage(`🔍 Recherche de créatives sur le serveur...`, chatId.toString(), token)

                try {
                    let creatives: any[] = []
                    
                    // 1. Scanner le disque (Priorité car l'utilisateur dit qu'elles sont là)
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books')
                    console.log(`[TELEGRAM] Scanning directory: ${uploadDir}`)
                    
                    try {
                        const files = await fs.readdir(uploadDir)
                        console.log(`[TELEGRAM] Found ${files.length} total files in directory`)
                        
                        const marketingFiles = files.filter(f => 
                            f.toLowerCase().startsWith('creative_') || 
                            f.toLowerCase().startsWith('pack_') || 
                            f.toLowerCase().startsWith('desc_') || 
                            f.toLowerCase().includes('pack')
                        ).sort().reverse().slice(0, 10)

                        console.log(`[TELEGRAM] Filtered ${marketingFiles.length} marketing files:`, marketingFiles)

                        if (marketingFiles.length > 0) {
                            creatives = marketingFiles.map(file => ({
                                name: file,
                                type: (file.toLowerCase().includes('pack')) ? 'PACK' : 'BOOK'
                            }))
                        }
                    } catch (fsErr: any) {
                        console.error('[TELEGRAM] Disk scan error:', fsErr)
                    }

                    console.log(`[TELEGRAM] Final creatives list size: ${creatives.length}`)

                    // 2. Tenter la DB si le disque n'a rien donné
                    if (creatives.length === 0) {
                        const dbAssets = await prisma.marketingAsset.findMany({
                            take: 10,
                            orderBy: { createdAt: 'desc' }
                        })
                        creatives = dbAssets.map(a => ({
                            name: a.name,
                            type: a.type,
                            bookId: a.bookId,
                            packId: a.packId
                        }))
                    }

                    if (creatives.length === 0) {
                        await sendTelegramMessage(`⚠️ Aucune créative trouvée dans <code>/public/uploads/books/</code>.\n\nFichiers attendus : commençant par <code>creative_</code> ou <code>pack_</code>.`, chatId.toString(), token)
                        return NextResponse.json({ ok: true })
                    }

                    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.store'

                    // Envoyer un album des 3 dernières images pour l'aperçu
                    if (creatives.length > 0) {
                        const album = creatives.slice(0, 3).map(c => ({
                            type: 'photo' as const,
                            media: `${siteUrl}/uploads/books/${c.name}`,
                            caption: `📸 Aperçu : ${c.name}`
                        }))
                        await sendTelegramMediaGroup(album, chatId.toString(), token)
                    }

                    const buttons = creatives.map(c => {
                        const label = c.name.length > 30 ? c.name.substring(0, 27) + '...' : c.name
                        const typeLabel = c.type === 'PACK' ? '📦' : '✨'
                        const itemId = (c as any).bookId || (c as any).packId || 'manual'
                        return [{ 
                            text: `${typeLabel} ${label}`, 
                            callback_data: `prep_creative:${itemId}:${c.type === 'PACK' ? 'PACK' : 'BOOK'}`.substring(0, 64)
                        }]
                    })

                    const replyMarkup = {
                        inline_keyboard: [
                            ...buttons,
                            [{ text: '🔍 Voir tout le site', url: `${siteUrl}/fr/admin/marketing` }]
                        ]
                    }

                    console.log(`[TELEGRAM] Sending final menu to ${chatId}`)
                    const result = await sendTelegramMessage(`🚀 <b>Marketing Riwaya</b>\n\nChoisissez une créative ci-dessus pour la publier :`, chatId.toString(), token, replyMarkup)
                    console.log(`[TELEGRAM] Final menu send result:`, result ? 'SUCCESS' : 'FAILED')
                } catch (error: any) {
                    console.error('[TELEGRAM ERROR] /GENERER failed:', error)
                    await sendTelegramMessage(`❌ Erreur lors du scan : ${error.message}`, chatId.toString(), token)
                }
            }
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
        console.error('[TELEGRAM WEBHOOK ERROR]:', error)
        if (currentCallbackId && currentToken) {
            try { await answerCallbackQuery(currentCallbackId, '❌ Erreur interne serveur', currentToken) } catch {}
        }
        return NextResponse.json({ ok: true })
    }
}
