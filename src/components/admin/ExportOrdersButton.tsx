'use client'

import * as XLSX from 'xlsx'
import { Download, FileSpreadsheet } from 'lucide-react'

interface ExportOrdersButtonProps {
    orders: any[]
}

export default function ExportOrdersButton({ orders }: ExportOrdersButtonProps) {
    const handleExport = () => {
        // Préparation des données pour l'Excel
        const dataToExport = orders.flatMap((order) => {
            // Pour chaque commande, on peut soit faire une ligne par commande
            // soit une ligne par article pour la logistique.
            // On va opter pour une ligne par article pour être le plus complet possible.
            return order.items.map((item: any, index: number) => ({
                'ID Commande': `#${order.id.slice(0, 8)}`,
                'Date': new Date(order.createdAt).toLocaleString('fr-FR'),
                'Statut': order.status,
                'Client': order.fullName,
                'Téléphone': order.phone,
                'Adresse': order.address,
                'Ville': order.city,
                'Article': item.type === 'BOOK' ? (item.book?.title || 'Livre inconnu') : (item.pack?.name || 'Pack inconnu'),
                'Type': item.type,
                'Quantité': item.quantity,
                'Prix Unitaire': item.price,
                'Total Article': item.price * item.quantity,
                'Total Commande': index === 0 ? order.total : '', // Uniquement sur la 1ère ligne de la commande
                'Remise': index === 0 ? (order.discount || 0) : '',
                'Code Promo': index === 0 ? (order.couponCode || '') : '',
                'Commentaire': order.comment || '',
            }))
        })

        // Création du classeur
        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes')

        // Génération du fichier et téléchargement
        const date = new Date().toISOString().split('T')[0]
        XLSX.writeFile(workbook, `Riwaya_Commandes_${date}.xlsx`)
    }

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100 uppercase tracking-wider"
        >
            <FileSpreadsheet className="w-5 h-5" />
            Exporter Excel
        </button>
    )
}
