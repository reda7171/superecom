'use server'

import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { verifyAdmin } from './auth'
import { createAuditLog } from './audit'
import { sendTelegramMessage } from '@/lib/telegram'

/**
 * Exporter les logs d'audit en Excel
 */
export async function exportAuditLogs() {
    try {
        await verifyAdmin()

        const logs = await (prisma as any).auditLog.findMany({
            orderBy: { createdAt: 'desc' }
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Audit Logs')

        worksheet.columns = [
            { header: 'Action', key: 'Action', width: 20 },
            { header: 'Entité', key: 'Entité', width: 20 },
            { header: 'ID_Entité', key: 'ID_Entité', width: 30 },
            { header: 'Admin', key: 'Admin', width: 30 },
            { header: 'Date', key: 'Date', width: 25 },
            { header: 'Détails', key: 'Détails', width: 50 },
        ]

        logs.forEach((log: any) => {
            worksheet.addRow({
                Action: log.action,
                Entité: log.entity,
                ID_Entité: log.entityId || 'N/A',
                Admin: log.adminId,
                Date: new Date(log.createdAt).toLocaleString('fr-FR'),
                Détails: log.details || '',
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()

        await createAuditLog({
            action: 'EXPORT',
            entity: 'AUTH',
            details: 'Exportation des logs d\'audit au format Excel'
        })

        sendTelegramMessage(`📥 *Exportation de Données*\nLogs d'audit exportés avec succès.\n🕒 ${new Date().toLocaleString('fr-FR')}`).catch(console.error)

        return Array.from(new Uint8Array(buffer as ArrayBuffer))
    } catch (error) {
        console.error('Erreur export audit:', error)
        return null
    }
}

/**
 * Exporter le rapport des ventes en Excel
 */
export async function exportSalesReport() {
    try {
        await verifyAdmin()

        const orders = await prisma.order.findMany({
            where: { status: 'DELIVERED' },
            include: {
                items: {
                    include: {
                        product: { select: { title: true, category: true } },
                        pack: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Ventes')

        worksheet.columns = [
            { header: 'ID_Commande', key: 'ID_Commande', width: 30 },
            { header: 'Client', key: 'Client', width: 25 },
            { header: 'Ville', key: 'Ville', width: 20 },
            { header: 'Date', key: 'Date', width: 15 },
            { header: 'Type', key: 'Type', width: 10 },
            { header: 'Produit', key: 'Produit', width: 30 },
            { header: 'Catégorie', key: 'Catégorie', width: 20 },
            { header: 'Quantité', key: 'Quantité', width: 10 },
            { header: 'Prix_Unitaire', key: 'Prix_Unitaire', width: 15 },
            { header: 'Sous_Total_Ligne', key: 'Sous_Total_Ligne', width: 18 },
            { header: 'Frais_Livraison', key: 'Frais_Livraison', width: 18 },
            { header: 'Remise', key: 'Remise', width: 10 },
            { header: 'Total_Commande', key: 'Total_Commande', width: 18 },
            { header: 'Paiement', key: 'Paiement', width: 15 },
            { header: 'Coupon', key: 'Coupon', width: 15 },
        ]

        orders.forEach((order) => {
            order.items.forEach((item) => {
                worksheet.addRow({
                    ID_Commande: order.id,
                    Client: order.fullName,
                    Ville: order.city,
                    Date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
                    Type: item.type,
                    Produit: item.product?.title || item.pack?.name || 'Inconnu',
                    Catégorie: item.product?.category || 'N/A',
                    Quantité: item.quantity,
                    Prix_Unitaire: item.price,
                    Sous_Total_Ligne: item.price * item.quantity,
                    Frais_Livraison: order.shippingFees,
                    Remise: order.discount,
                    Total_Commande: order.total,
                    Paiement: order.paymentMethod,
                    Coupon: order.couponCode || 'Aucun',
                })
            })
        })

        const buffer = await workbook.xlsx.writeBuffer()

        await createAuditLog({
            action: 'EXPORT',
            entity: 'ORDER',
            details: 'Exportation du rapport des ventes au format Excel'
        })

        sendTelegramMessage(`📥 *Exportation de Données*\nRapport des ventes exporté.\n🕒 ${new Date().toLocaleString('fr-FR')}`).catch(console.error)

        return Array.from(new Uint8Array(buffer as ArrayBuffer))
    } catch (error) {
        console.error('Erreur export ventes:', error)
        return null
    }
}
