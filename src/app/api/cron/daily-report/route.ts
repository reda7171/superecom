import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

export async function GET(request: Request) {
    try {
        // Sécurisation: exiger un token dans l'URL (?token=XYZ) pour authentifier Vercel Cron
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')
        const CRON_SECRET = process.env.CRON_SECRET

        if (!CRON_SECRET || token !== CRON_SECRET) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // 1. Commandes des dernières 24h
        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: yesterday
                }
            }
        })

        const totalOrders = recentOrders.length
        const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0)

        // 2. Vérification des stocks (Livres <= 5)
        const lowStockBooks = await prisma.product.count({
            where: {
                stock: {
                    lte: 5
                }
            }
        })

        // 3. Vérification des avis en attente de modération
        const pendingReviews = await prisma.review.count({
            where: {
                isApproved: false
            }
        })

        // 4. Clients inscrits récemment
        const newUsers = await prisma.user.count({
            where: {
                createdAt: {
                    gte: yesterday
                }
            }
        })

        // Construction du message
        const message = `📊 *Rapport Quotidien du Site (Santé)*\n\n` +
            `📅 *Date:* ${now.toLocaleDateString('fr-FR')}\n\n` +
            `🛒 *Commandes (24h):* ${totalOrders}\n` +
            `💰 *Chiffre d'Affaires:* ${totalRevenue.toFixed(2)} MAD\n` +
            `👤 *Nouveaux Clients:* ${newUsers}\n\n` +
            `⚠️ *Alertes & Actions requises:*\n` +
            `📦 Livres en stock faible ou épuisés : ${lowStockBooks}\n` +
            `⭐ Avis en attente de modération : ${pendingReviews}\n\n` +
            `✅ *État de la base de données:* En ligne`;

        // Envoi sur Telegram
        await sendTelegramMessage(message)

        return NextResponse.json({ success: true, message: 'Rapport envoyé avec succès' })
    } catch (error: any) {
        console.error('Erreur CRON Daily Report:', error)
        
        // Alerte critique si la base de données est down
        sendTelegramMessage(`❌ *Erreur Critique*\nImpossible de générer le rapport quotidien. La base de données ou le serveur rencontre un problème.\nErreur: ${error.message}`).catch(console.error)
        
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
