'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface ExportButtonProps {
    action: () => Promise<number[] | null>
    filename: string
    label: string
}

export default function ExportButton({ action, filename, label }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        try {
            setLoading(true)
            const data = await action()

            if (!data) {
                alert('Erreur lors de l\'exportation')
                return
            }

            // Conversion du tableau d'octets en Blob
            const blob = new Blob([new Uint8Array(data)], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })

            // Création du lien de téléchargement
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()

            // Nettoyage
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export error:', error)
            alert('Une erreur est survenue lors du téléchargement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-green-700"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Download size={18} />
            )}
            {label}
        </button>
    )
}
