import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'
import { getSetting } from '@/lib/actions/site-settings'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        // Sécurisation: exiger un token dans l'URL (?token=XYZ) pour authentifier Vercel Cron
        const { searchParams } = new URL(req.url)
        const token = searchParams.get('token')
        const CRON_SECRET = process.env.CRON_SECRET

        if (!CRON_SECRET || token !== CRON_SECRET) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // 1. Vérifier si activé
        const shouldNotify = await getSetting('telegram_notify_daily_summary') !== 'false'
        if (!shouldNotify) {
            return NextResponse.json({ skipped: true, reason: 'Disabled in settings' })
        }

        // 2. Calculer les dates (Aujourd'hui)
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

        // 3. Récupérer les commandes du jour
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    not: 'CANCELLED'
                }
            },
            include: {
                items: true
            }
        })

        if (orders.length === 0) {
            await sendTelegramMessage(`📊 <b>Résumé Journalier</b>\n\nAucune commande enregistrée aujourd'hui.`)
            return NextResponse.json({ success: true, orders: 0 })
        }

        // 4. Calculer CA et Stats
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
        
        // Trouver le livre le plus vendu
        const bookStats: Record<string, { title: string, qty: number }> = {}
        
        for (const order of orders) {
            for (const item of order.items) {
                if (item.bookId) {
                    // On récupère le titre si on l'a pas
                    if (!bookStats[item.bookId]) {
                        const book = await prisma.book.findUnique({ where: { id: item.bookId }, select: { title: true } })
                        bookStats[item.bookId] = { title: book?.title || 'Livre inconnu', qty: 0 }
                    }
                    bookStats[item.bookId].qty += item.quantity
                }
            }
        }

        const bestSeller = Object.values(bookStats).sort((a, b) => b.qty - a.qty)[0]

        // 5. Envoyer le message
        const text = `📊 <b>Résumé Journalier - Riwaya</b>\n\n` +
            `📅 <b>Date:</b> ${startOfDay.toLocaleDateString('fr-FR')}\n` +
            `📦 <b>Commandes:</b> ${orders.length}\n` +
            `💰 <b>Chiffre d'Affaires:</b> ${totalRevenue.toFixed(2)} MAD\n\n` +
            (bestSeller ? `🔥 <b>Top Vente:</b> ${bestSeller.title} (${bestSeller.qty} expl.)\n` : '') +
            `🚀 <i>Continuez comme ça !</i>`

        await sendTelegramMessage(text)

        return NextResponse.json({ success: true, orders: orders.length, revenue: totalRevenue })

    } catch (error) {
        console.error('Erreur Résumé Journalier:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
