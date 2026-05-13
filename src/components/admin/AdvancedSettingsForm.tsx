'use client'

import { useState } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import {
    Save,
    Loader2,
    Store,
    RefreshCcw,
    Usb,
    Baby,
    BookOpen,
    ToggleLeft,
    ToggleRight,
    Zap,
    MessageCircle,
    Database,
    Download,
    Package
} from 'lucide-react'

interface AdvancedSettingsFormProps {
    initialSettings: Record<string, string>
}

// Définition des fonctionnalités à activer/désactiver
const FEATURES = [
    {
        key: 'feature_seller',
        label: 'Devenir Vendeur',
        description: 'Active la page "Devenir Vendeur" et le formulaire de candidature.',
        icon: Store,
        color: 'text-amber-600'
    },
    {
        key: 'feature_exchange',
        label: 'Échange de Livres',
        description: 'Active la communauté d\'échange de livres entre membres.',
        icon: RefreshCcw,
        color: 'text-blue-600'
    },
    {
        key: 'feature_usb',
        label: 'Clé USB',
        description: 'Active la page des commandes de Clés USB.',
        icon: Usb,
        color: 'text-teal-600'
    },
    {
        key: 'feature_kids',
        label: 'Mon Enfant',
        description: 'Active la page de la collection livres pour enfants.',
        icon: Baby,
        color: 'text-pink-600'
    },
    {
        key: 'feature_reading_list',
        label: 'Suivi de Lecture',
        description: 'Active la fonctionnalité de liste et suivi de lecture dans les profils.',
        icon: BookOpen,
        color: 'text-green-600'
    },
    {
        key: 'feature_digital_books',
        label: 'Livres Numériques',
        description: 'Active la vente et le téléchargement de livres numériques (PDF).',
        icon: Zap,
        color: 'text-amber-600'
    },
    {
        key: 'feature_packs',
        label: 'Vente de Packs',
        description: 'Active la gestion et la vente de packs de livres (ex: Pack 3 livres).',
        icon: Package,
        color: 'text-blue-500'
    },
    {
        key: 'feature_chatbot',
        label: 'Assistant Riwaya',
        description: 'Active l\'assistant virtuel (ChatBot) sur toutes les pages du site.',
        icon: Zap,
        color: 'text-indigo-600'
    },
    {
        key: 'feature_whatsapp',
        label: 'Bouton WhatsApp',
        description: 'Active le bouton flottant WhatsApp pour le contact direct.',
        icon: MessageCircle,
        color: 'text-green-500'
    },
]

export default function AdvancedSettingsForm({ initialSettings }: AdvancedSettingsFormProps) {
    // true = activé, false = désactivé (défaut: activé si pas défini)
    const [features, setFeatures] = useState<Record<string, boolean>>(() => {
        const map: Record<string, boolean> = {}
        FEATURES.forEach(f => {
            map[f.key] = initialSettings[f.key] !== 'false'
        })
        return map
    })
    const [loading, setLoading] = useState(false)
    const [backupLoading, setBackupLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const toggle = (key: string) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage(null)

        const settingsArray = FEATURES.map(f => ({
            key: f.key,
            value: features[f.key] ? 'true' : 'false',
            category: 'features',
            description: f.label
        }))

        const result = await updateMultipleSettings(settingsArray)

        if (result.success) {
            setMessage({ type: 'success', text: 'Paramètres avancés enregistrés avec succès !' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
        }

        setLoading(false)
    }

    const handleBackup = async () => {
        setBackupLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/database/backup')
            
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Erreur lors de la génération du backup')
            }

            // Récupérer le nom du fichier depuis les headers
            const disposition = res.headers.get('Content-Disposition')
            let filename = 'backup_riwaya.sql'
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/"/g, '')
            }

            // Créer un blob et lancer le téléchargement
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setMessage({ type: 'success', text: 'Backup SQL généré et téléchargé avec succès !' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setBackupLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* En-tête section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    Fonctionnalités
                </h2>
                <p className="text-sm text-gray-500 mb-8">Activez ou désactivez les modules de la plateforme instantanément.</p>

                <div className="space-y-4">
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon
                        const isEnabled = features[feature.key]

                        return (
                            <div
                                key={feature.key}
                                className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-200 ${isEnabled
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icône */}
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-black' : 'bg-gray-100'}`}>
                                        <Icon className={`w-5 h-5 ${isEnabled ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                    {/* Texte */}
                                    <div>
                                        <p className={`text-sm font-black ${isEnabled ? 'text-black' : 'text-gray-400'}`}>
                                            {feature.label}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
                                    </div>
                                </div>

                                {/* Toggle visuel */}
                                <button
                                    type="button"
                                    onClick={() => toggle(feature.key)}
                                    className="flex items-center gap-2 flex-shrink-0 focus:outline-none"
                                >
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isEnabled ? 'text-black' : 'text-gray-400'}`}>
                                        {isEnabled ? 'Activé' : 'Désactivé'}
                                    </span>
                                    {isEnabled
                                        ? <ToggleRight className="w-8 h-8 text-black" />
                                        : <ToggleLeft className="w-8 h-8 text-gray-300" />
                                    }
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Section Maintenance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    Maintenance & Base de données
                </h2>
                <p className="text-sm text-gray-500 mb-8">Gérez la sécurité et les sauvegardes de vos données.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleBackup}
                        disabled={backupLoading}
                        className="flex-1 flex items-center justify-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-black transition-all bg-white group"
                    >
                        {backupLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-black" />
                        ) : (
                            <Download className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
                        )}
                        <div className="text-left">
                            <p className="text-sm font-black text-black">Sauvegarder la Base de Données</p>
                            <p className="text-xs text-gray-400">Génère un fichier .sql complet</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Message feedback */}
            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            {/* Bouton sauvegarde */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Enregistrer
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
