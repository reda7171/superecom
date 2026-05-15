import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { answerCallbackQuery, editTelegramMessage, sendTelegramMessage } from '@/lib/telegram'
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
                    const payload = {
                        bookId: itemType === 'BOOK' ? itemId : null,
                        packId: itemType === 'PACK' ? itemId : null,
                        format: 'story',
                        platform: platform,
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
            
            // Format: stats:{period}
            else if (data && data.startsWith('stats:')) {
                const [, period] = data.split(':')
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

                    const [count, revenue, visitors, registrations] = await Promise.all([
                        prisma.order.count({ where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } } }),
                        prisma.order.aggregate({
                            where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
                            _sum: { total: true }
                        }),
                        showVisitors ? prisma.pageView.groupBy({
                            by: ['sessionId'],
                            where: { createdAt: { gte: start, lte: end } }
                        }).then(res => res.length) : Promise.resolve(0),
                        showRegistrations ? prisma.user.count({
                            where: { createdAt: { gte: start, lte: end }, role: 'USER' }
                        }) : Promise.resolve(0)
                    ])

                    let text = `📊 <b>RAPPORT : ${label.toUpperCase()}</b>\n\n` +
                               `📦 Commandes : <b>${count}</b>\n` +
                               `💰 CA Estimé : <b>${(revenue._sum.total || 0).toFixed(2)} MAD</b>`
                    
                    if (showVisitors) text += `\n👥 Visiteurs Uniques : <b>${visitors}</b>`
                    if (showRegistrations) text += `\n👤 Inscriptions : <b>${registrations}</b>`

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
                            f.startsWith('creative_') || f.startsWith('pack_') || f.startsWith('desc_') || f.includes('pack')
                        ).sort().reverse().slice(0, 10)

                        if (marketingFiles.length > 0) {
                            creatives = marketingFiles.map(file => ({
                                name: file,
                                type: file.startsWith('pack') ? 'PACK' : 'BOOK'
                            }))
                        }
                    } catch (fsErr: any) {
                        console.error('[TELEGRAM] Disk scan error:', fsErr)
                        // Ne pas bloquer, on tentera la DB après
                    }

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

                    const buttons = creatives.map(c => {
                        const label = c.name.length > 30 ? c.name.substring(0, 27) + '...' : c.name
                        const typeLabel = c.type === 'PACK' ? '📦' : '✨'
                        const itemId = (c as any).bookId || (c as any).packId || 'manual'
                        return [{ 
                            text: `${typeLabel} ${label}`, 
                            callback_data: `prep_creative:${itemId}:${c.type === 'PACK' ? 'PACK' : 'BOOK'}` 
                        }]
                    })

                    const replyMarkup = {
                        inline_keyboard: [
                            ...buttons,
                            [{ text: '🔍 Voir tout le site', url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/admin/marketing` }]
                        ]
                    }

                    await sendTelegramMessage(`🚀 <b>Marketing Riwaya</b>\n\nVoici les dernières créatives trouvées :`, chatId.toString(), token, replyMarkup)
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
