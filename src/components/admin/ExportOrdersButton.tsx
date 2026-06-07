'use client'

import { Download, FileSpreadsheet } from 'lucide-react'

interface ExportOrdersButtonProps {
    orders: any[]
}

/**
 * Export CSV côté client — remplace xlsx (vulnérable, aucun fix disponible)
 */
export default function ExportOrdersButton({ orders }: ExportOrdersButtonProps) {
    const handleExport = () => {
        const rows: string[][] = []

        // En-têtes
        rows.push([
            'ID Commande', 'Date', 'Statut', 'Client', 'Téléphone',
            'Adresse', 'Ville', 'Article', 'Type', 'Quantité',
            'Prix Unitaire', 'Total Article', 'Total Commande',
            'Remise', 'Code Promo', 'Commentaire'
        ])

        orders.forEach((order) => {
            order.items.forEach((item: any, index: number) => {
                rows.push([
                    `#${order.id.slice(0, 8)}`,
                    new Date(order.createdAt).toLocaleString('fr-FR'),
                    order.status,
                    order.fullName,
                    order.phone,
                    order.address,
                    order.city,
                    item.type === 'BOOK'
                        ? (item.product?.title || 'Livre inconnu')
                        : (item.pack?.name || 'Pack inconnu'),
                    item.type,
                    String(item.quantity),
                    String(item.price),
                    String(item.price * item.quantity),
                    index === 0 ? String(order.total) : '',
                    index === 0 ? String(order.discount || 0) : '',
                    index === 0 ? (order.couponCode || '') : '',
                    order.comment || '',
                ])
            })
        })

        // Construire le CSV avec BOM pour Excel (support UTF-8 / Arabic)
        const csvContent = '\uFEFF' + rows
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const date = new Date().toISOString().split('T')[0]
        link.href = url
        link.setAttribute('download', `Riwaya_Commandes_${date}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100 uppercase tracking-wider"
        >
            <FileSpreadsheet className="w-5 h-5" />
            Exporter CSV
        </button>
    )
}
