// Lib Telegram Bot - Envoi de messages et notifications
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

/**
 * Récupérer l'IP du client de manière sécurisée
 */
async function getClientIp(): Promise<string> {
    try {
        const headersList = await headers()
        const forwardedFor = headersList.get('x-forwarded-for')
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim()
        }
        return headersList.get('x-real-ip') || 'unknown'
    } catch (e) {
        return 'system'
    }
}

/**
 * Récupérer la localisation à partir de l'IP
 */
async function getLocationFromIp(ip: string): Promise<string> {
    if (!ip || ip === 'unknown' || ip === 'system' || ip.startsWith('127.') || ip === '::1') {
        return 'Localisation inconnue'
    }
    try {
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`)
        const data = await res.json()
        if (data.status === 'success') {
            return `${data.country}, ${data.city}`
        }
    } catch (e) {}
    return 'Localisation inconnue'
}


const TELEGRAM_API = 'https://api.telegram.org/bot'

// Récupérer le token Telegram depuis la base de données
async function getTelegramToken(): Promise<string> {
    const setting = await prisma.siteSettings.findUnique({ where: { key: 'telegram_bot_token' } })
    return setting?.value || process.env.TELEGRAM_BOT_TOKEN || ''
}

async function getTelegramChatId(): Promise<string> {
    const setting = await prisma.siteSettings.findUnique({ where: { key: 'telegram_chat_id' } })
    return setting?.value || process.env.TELEGRAM_CHAT_ID || ''
}


// Envoyer une notification de nouvelle commande avec boutons de changement de statut
export async function sendOrderNotification(order: {
    id: string
    fullName: string
    phone: string
    city: string
    total: number
    status: string
    items?: { quantity: number; book?: { title: string } | null; pack?: { name: string } | null }[]
}) {
    const botToken = await getTelegramToken()
    const chatId = await getTelegramChatId()

    if (!botToken || !chatId) return

    const orderSetting = await prisma.siteSettings.findUnique({ where: { key: 'telegram_notify_orders' } })
    if (orderSetting?.value === 'false') return

    const ip = await getClientIp()
    const location = await getLocationFromIp(ip)
    const shortId = order.id.slice(0, 8).toUpperCase()
    const itemsList = order.items
        ?.map(i => `  • ${i.book?.title || i.pack?.name || 'Article'} x${i.quantity}`)
        .join('\n') || ''

    const text = `🛒 <b>Nouvelle Commande #${shortId}</b>\n\n` +
        `👤 <b>Client:</b> ${order.fullName}\n` +
        `📞 <b>Téléphone:</b> ${order.phone}\n` +
        `📍 <b>Ville (Saisie):</b> ${order.city}\n` +
        `🌍 <b>Pays/Ville (IP):</b> ${location}\n` +
        `💰 <b>Total:</b> ${order.total.toFixed(2)} MAD\n` +
        (itemsList ? `\n📦 <b>Articles:</b>\n${itemsList}\n` : '') +
        `🌐 <b>IP:</b> ${ip}\n` +
        `\n🔗 <a href="${process.env.NEXTAUTH_URL}/fr/admin/orders/${order.id}">Voir la commande</a>`

    let cleanPhone = order.phone.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '212' + cleanPhone.substring(1)
    } else if (!cleanPhone.startsWith('212') && cleanPhone.length === 9) {
        cleanPhone = '212' + cleanPhone
    }

    const whatsappMsg = encodeURIComponent(`Bonjour ${order.fullName},\n\nVotre commande #${shortId} sur Riwaya a bien été reçue. Nous préparons votre colis pour une livraison rapide à ${order.city}.\n\nMerci de votre confiance ! 📚✨`)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${whatsappMsg}`

    const keyboard = {
        inline_keyboard: [
            [
                { text: '💬 WhatsApp Confirm', url: whatsappUrl }
            ],
            [
                { text: '✅ Confirmer', callback_data: `order_status:${order.id}:CONFIRMED` },
                { text: '🚚 En livraison', callback_data: `order_status:${order.id}:SHIPPED` }
            ],
            [
                { text: '📦 Livrée', callback_data: `order_status:${order.id}:DELIVERED` },
                { text: '🔄 Retournée', callback_data: `order_status:${order.id}:RETURNED` }
            ],
            [
                { text: '❌ Annuler', callback_data: `order_status:${order.id}:CANCELLED` }
            ]
        ]
    }

    const chatIds = String(chatId).split(',').map(id => id.trim()).filter(id => id.length > 0)

    const promises = chatIds.map(id => 
        fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: id,
                text,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        }).then(res => res.json())
    )

    const results = await Promise.all(promises)
    return results[0]
}

// Répondre à un callback (bouton pressé)
export async function answerCallbackQuery(callbackQueryId: string, text: string, token: string) {
    await fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text })
    })
}

// Modifier le message original après action
export async function editTelegramMessage(chatId: string | number, messageId: number, text: string, token: string) {
    await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: 'HTML'
        })
    })
}

// Configurer le webhook Telegram
export async function setTelegramWebhook(webhookUrl: string, token: string) {
    const res = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
    })
    return res.json()
}

// Supprimer le webhook
export async function deleteTelegramWebhook(token: string) {
    const res = await fetch(`${TELEGRAM_API}${token}/deleteWebhook`, { method: 'POST' })
    return res.json()
}
// Envoyer une notification lors de l'inscription d'un nouvel utilisateur
export async function sendUserRegistrationNotification(user: {
    fullName: string
    email: string
    city: string
    role?: string
}) {
    const botToken = await getTelegramToken()
    const chatId = await getTelegramChatId()

    if (!botToken || !chatId) return

    const regSetting = await prisma.siteSettings.findUnique({ where: { key: 'telegram_notify_register' } })
    if (regSetting?.value !== 'true') return

    const ip = await getClientIp()
    const location = await getLocationFromIp(ip)
    const text = `👤 <b>Nouveau Compte Créé</b>\n\n` +
        `📛 <b>Nom:</b> ${user.fullName}\n` +
        `📧 <b>Email:</b> ${user.email}\n` +
        `📍 <b>Ville:</b> ${user.city}\n` +
        `🌍 <b>Pays/Ville (IP):</b> ${location}\n` +
        `🔑 <b>Rôle:</b> ${user.role || 'USER'}\n` +
        `🌐 <b>IP:</b> ${ip}\n` +
        `📅 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}`

    const chatIds = String(chatId).split(',').map(id => id.trim()).filter(id => id.length > 0)

    const promises = chatIds.map(id => 
        fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: id,
                text,
                parse_mode: 'HTML'
            })
        }).then(res => res.json())
    )

    const results = await Promise.all(promises)
    return results[0]
}

/**
 * Envoyer un message Telegram générique
 */
export async function sendTelegramMessage(text: string, forceChatId?: string, forceToken?: string, replyMarkup?: any) {
    const token = forceToken || await getTelegramToken()
    const chatId = forceChatId || await getTelegramChatId()

    if (!token || !chatId) return

    const ip = await getClientIp()
    const location = await getLocationFromIp(ip)
    const textWithIp = text.includes('🌐 <b>IP:</b>') ? text : `${text}\n\n🌍 <b>Localisation:</b> ${location}\n🌐 <b>IP:</b> ${ip}`

    const chatIds = String(chatId).split(',').map(id => id.trim()).filter(id => id.length > 0)

    const promises = chatIds.map(id => 
        fetch(`${TELEGRAM_API}${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: id,
                text: textWithIp,
                parse_mode: 'HTML',
                reply_markup: replyMarkup
            })
        }).then(res => res.json())
    )

    const results = await Promise.all(promises)
    return results[0]
}

/**
 * Notification pour un nouvel avis client (avec boutons)
 */
export async function sendReviewNotification(review: { id: string, fullName: string, rating: number, comment: string }) {
    const shouldNotify = await prisma.siteSettings.findUnique({ where: { key: 'telegram_notify_reviews' } })
    if (shouldNotify?.value === 'false') return

    const text = `⭐ <b>Nouvel Avis Client</b>\n\n` +
        `👤 <b>Client:</b> ${review.fullName}\n` +
        `⭐ <b>Note:</b> ${review.rating}/5\n` +
        `💬 <b>Message:</b> <i>${review.comment}</i>\n\n` +
        `📥 <i>Action requise :</i>`

    const replyMarkup = {
        inline_keyboard: [
            [
                { text: '✅ Approuver', callback_data: `approve_review:${review.id}` },
                { text: '🗑️ Supprimer', callback_data: `delete_review:${review.id}` }
            ]
        ]
    }

    return sendTelegramMessage(text, undefined, undefined, replyMarkup)
}

/**
 * Alerte stock faible
 */
export async function sendLowStockNotification(book: { title: string, stock: number }) {
    const botToken = await getTelegramToken()
    const chatId = await getTelegramChatId()
    if (!botToken || !chatId) return

    const shouldNotify = await prisma.siteSettings.findUnique({ where: { key: 'telegram_notify_low_stock' } })
    if (shouldNotify?.value === 'false') return

    const text = `⚠️ <b>Alerte Stock Faible</b>\n\n` +
        `📖 <b>Livre:</b> ${book.title}\n` +
        `📦 <b>Stock restant:</b> <b>${book.stock}</b>\n\n` +
        `<i>Il est temps de prévoir un réapprovisionnement.</i>`

    return sendTelegramMessage(text)
}
