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
        
        let totalItems = 0
        let totalCogs = 0
        let pendingCount = 0
        let deliveredCount = 0
        let cancelledCount = 0
        let returnedCount = 0

        const statusCounts = await prisma.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: startOfDay, lte: endOfDay } },
            _count: { status: true }
        })

        statusCounts.forEach(s => {
            if (s.status === 'PENDING') pendingCount = s._count.status
            if (s.status === 'DELIVERED') deliveredCount = s._count.status
            if (s.status === 'CANCELLED') cancelledCount = s._count.status
            if (s.status === 'RETURNED') returnedCount = s._count.status
        })

        const deliveryResolved = deliveredCount + returnedCount
        const deliverySuccessRate = deliveryResolved > 0 ? ((deliveredCount / deliveryResolved) * 100).toFixed(1) : '0.0'

        const abandoned = await prisma.abandonedCart.aggregate({
            where: { createdAt: { gte: startOfDay, lte: endOfDay }, status: 'PENDING' },
            _count: { id: true },
            _sum: { total: true }
        })
        const abandonedCount = abandoned._count.id || 0
        const abandonedValue = abandoned._sum.total || 0

        const expenses = await prisma.expense.aggregate({
            where: { date: { gte: startOfDay, lte: endOfDay } },
            _sum: { amount: true }
        })
        const totalExpenses = expenses._sum.amount || 0

        const discountResult = await prisma.order.aggregate({
            where: { createdAt: { gte: startOfDay, lte: endOfDay }, status: { not: 'CANCELLED' } },
            _sum: { discount: true }
        })
        const totalDiscounts = discountResult._sum.discount || 0

        const lowStockCount = await prisma.book.count({
            where: { active: true, stock: { lt: 5 } }
        })

        const blogViews = await prisma.pageView.count({
            where: { createdAt: { gte: startOfDay, lte: endOfDay }, url: { contains: '/blog/' } }
        })
        const pendingComments = await prisma.comment.count({
            where: { isApproved: false }
        })
        const publishedPosts = await prisma.post.count({
            where: { published: true }
        })

        // Trouver le livre le plus vendu et le nombre d'articles
        const bookStats: Record<string, { title: string, qty: number, category?: string | null }> = {}
        const categoryStats: Record<string, number> = {}
        
        for (const order of orders) {
            for (const item of order.items) {
                totalItems += item.quantity
                totalCogs += item.quantity * (item.costPrice || 0)
                if (item.bookId) {
                    if (!bookStats[item.bookId]) {
                        const book = await prisma.book.findUnique({ where: { id: item.bookId }, select: { title: true, category: true } })
                        bookStats[item.bookId] = { title: book?.title || 'Livre inconnu', qty: 0, category: book?.category }
                    }
                    bookStats[item.bookId].qty += item.quantity
                    
                    const cat = bookStats[item.bookId].category
                    if (cat) {
                        categoryStats[cat] = (categoryStats[cat] || 0) + item.quantity
                    }
                }
            }
        }

        const topCategories = Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat, qty]) => `${cat}: ${qty}`)
            .join(' | ') || 'Aucune'

        const bestSeller = Object.values(bookStats).sort((a, b) => b.qty - a.qty)[0]
        const aov = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'
        const margin = totalRevenue - totalCogs - totalExpenses

        // 5. Envoyer le message
        const text = `📊 <b>Résumé Journalier - Riwaya</b>\n\n` +
            `📅 <b>Date:</b> ${startOfDay.toLocaleDateString('fr-FR')}\n` +
            `📦 <b>Commandes:</b> ${orders.length}\n` +
            `🛒 <b>Articles Vendus:</b> ${totalItems}\n` +
            `💰 <b>CA:</b> ${totalRevenue.toFixed(2)} MAD\n` +
            `📈 <b>Panier Moyen:</b> ${aov} MAD\n` +
            `💸 <b>Dépenses:</b> ${totalExpenses.toFixed(2)} MAD\n` +
            `💎 <b>Bénéfice Est.:</b> ${margin.toFixed(2)} MAD\n` +
            `🎁 <b>Remises Accordées:</b> ${totalDiscounts.toFixed(2)} MAD\n` +
            `🛒 <b>Paniers Abandonnés:</b> ${abandonedCount} (${abandonedValue.toFixed(2)} MAD)\n\n` +
            `📉 <b>Statuts (Créées aujourd'hui)</b>\n` +
            `⏳ En Attente: ${pendingCount} | ✅ Livrées: ${deliveredCount} | 🔄 Retour: ${returnedCount} | ❌ Annulées: ${cancelledCount}\n` +
            `🎯 <b>Taux Succès Livraison:</b> ${deliverySuccessRate}%\n\n` +
            `📚 <b>Top Catégories :</b> ${topCategories}\n\n` +
            `📝 <b>BLOG</b>\n` +
            `📖 Vues (Aujourd'hui) : <b>${blogViews}</b>\n` +
            `💬 Commentaires en attente : <b>${pendingComments}</b>\n` +
            `📝 Articles Publiés : <b>${publishedPosts}</b>\n\n` +
            `⚠️ <b>ALERTES</b>\n` +
            `📉 Livres en stock faible (<5) : <b>${lowStockCount}</b>\n\n` +
            (bestSeller ? `🔥 <b>Top Vente:</b> ${bestSeller.title} (${bestSeller.qty} expl.)\n` : '') +
            `🚀 <i>Continuez comme ça !</i>`

        await sendTelegramMessage(text)

        return NextResponse.json({ success: true, orders: orders.length, revenue: totalRevenue })

    } catch (error) {
        console.error('Erreur Résumé Journalier:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
