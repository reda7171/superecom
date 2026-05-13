'use client'

import { useState, useEffect } from 'react'
import { Database, Download, Trash2, Plus, RefreshCw, FileText, Calendar, HardDrive, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface BackupFile {
    name: string
    size: number
    createdAt: string
}

export default function DatabasePage() {
    const [backups, setBackups] = useState<BackupFile[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchBackups = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/backups')
            const data = await res.json()
            if (data.success) {
                setBackups(data.backups)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError("Impossible de charger les sauvegardes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBackups()
    }, [])

    const handleCreateBackup = async () => {
        try {
            setGenerating(true)
            setError(null)
            const res = await fetch('/api/admin/backups', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                await fetchBackups()
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError("Erreur lors de la génération de la sauvegarde")
        } finally {
            setGenerating(false)
        }
    }

    const handleDelete = async (filename: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) return
        try {
            const res = await fetch(`/api/admin/backups/${filename}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setBackups(backups.filter(b => b.name !== filename))
            }
        } catch (err) {
            alert("Erreur lors de la suppression")
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-indigo-600" />
                        Base de Données
                    </h1>
                    <p className="text-gray-500 mt-1">Gérez vos sauvegardes et la sécurité de vos données</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={generating}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    {generating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                    Générer une Sauvegarde .sql
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">Erreur détectée</p>
                        <p className="text-xs opacity-90">{error}</p>
                        <p className="text-[10px] mt-2 italic opacity-75">Note: Assurez-vous que 'mysqldump' est installé sur le serveur.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Sauvegardes disponibles ({backups.length})
                    </h2>
                    <button 
                        onClick={fetchBackups}
                        className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-gray-100"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-tighter border-b border-gray-50 bg-gray-50/30">
                                <th className="px-6 py-4">Fichier</th>
                                <th className="px-6 py-4">Taille</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {backups.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <HardDrive className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-sm font-medium">Aucune sauvegarde trouvée</p>
                                            <p className="text-xs">Cliquez sur le bouton en haut à droite pour en générer une.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                backups.map((backup) => (
                                    <tr key={backup.name} className="group hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{backup.name}</p>
                                                    <p className="text-[10px] text-gray-400">SQL Dump File</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                {formatSize(backup.size)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {format(new Date(backup.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/api/admin/backups/${backup.name}`}
                                                    className="p-2 text-indigo-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-indigo-100"
                                                    title="Télécharger"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(backup.name)}
                                                    className="p-2 text-red-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-red-100"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    Sécurité et Recommandations
                </h3>
                <ul className="text-sm text-amber-700/80 space-y-2 list-disc list-inside">
                    <li>Téléchargez régulièrement vos sauvegardes sur un support externe (Cloud, disque dur).</li>
                    <li>Ne stockez pas trop de sauvegardes sur le serveur pour éviter de saturer l'espace disque.</li>
                    <li>En cas de restauration, vérifiez l'intégrité du fichier SQL avant de l'injecter.</li>
                    <li>Pour restaurer une sauvegarde, utilisez un outil comme <strong>phpMyAdmin</strong> ou la ligne de commande <code>mysql</code>.</li>
                </ul>
            </div>
        </div>
    )
}
