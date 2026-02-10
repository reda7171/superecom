'use server'

import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { verifyAdmin } from './auth'
import { createAuditLog } from './audit'

/**
 * Exporter les logs d'audit en Excel
 */
export async function exportAuditLogs() {
    try {
        await verifyAdmin()

        const logs = await (prisma as any).auditLog.findMany({
            orderBy: { createdAt: 'desc' }
        })

        const data = logs.map((log: any) => ({
            Action: log.action,
            Entité: log.entity,
            ID_Entité: log.entityId || 'N/A',
            Admin: log.adminId,
            Date: new Date(log.createdAt).toLocaleString('fr-FR'),
            Détails: log.details || ''
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs')

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

        await createAuditLog({
            action: 'EXPORT',
            entity: 'AUTH',
            details: 'Exportation des logs d\'audit au format Excel'
        })

        return Array.from(new Uint8Array(buffer)) // Return as array for serializability
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
                        book: { select: { title: true, category: true } },
                        pack: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const data = orders.flatMap((order) =>
            order.items.map((item) => ({
                ID_Commande: order.id,
                Client: order.fullName,
                Ville: order.city,
                Date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
                Type: item.type,
                Produit: item.book?.title || item.pack?.name || 'Inconnu',
                Catégorie: item.book?.category || 'N/A',
                Quantité: item.quantity,
                Prix_Unitaire: item.price,
                Sous_Total_Ligne: item.price * item.quantity,
                Frais_Livraison: order.shippingFees,
                Remise: order.discount,
                Total_Commande: order.total,
                Paiement: order.paymentMethod,
                Coupon: order.couponCode || 'Aucun'
            }))
        )

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes')

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

        await createAuditLog({
            action: 'EXPORT',
            entity: 'ORDER',
            details: 'Exportation du rapport des ventes au format Excel'
        })

        return Array.from(new Uint8Array(buffer))
    } catch (error) {
        console.error('Erreur export ventes:', error)
        return null
    }
}
