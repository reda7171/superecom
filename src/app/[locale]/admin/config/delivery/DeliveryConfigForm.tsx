'use client'

import { useState } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import { Bell, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeliveryConfigForm({ 
    initialApiUrl, 
    initialApiKey,
    initialAnnouncementEnabled,
    initialAnnouncementMessage,
    initialAnnouncementBgColor,
    initialAnnouncementTextColor
}: { 
    initialApiUrl: string, 
    initialApiKey: string,
    initialAnnouncementEnabled: boolean,
    initialAnnouncementMessage: string,
    initialAnnouncementBgColor: string,
    initialAnnouncementTextColor: string
}) {
    const [apiUrl, setApiUrl] = useState(initialApiUrl)
    const [apiKey, setApiKey] = useState(initialApiKey)
    const [announcementEnabled, setAnnouncementEnabled] = useState(initialAnnouncementEnabled)
    const [announcementMessage, setAnnouncementMessage] = useState(initialAnnouncementMessage)
    const [announcementBgColor, setAnnouncementBgColor] = useState(initialAnnouncementBgColor)
    const [announcementTextColor, setAnnouncementTextColor] = useState(initialAnnouncementTextColor)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateMultipleSettings([
                { key: 'delivery_api_url', value: apiUrl, category: 'config', description: 'URL de l\'API Livraison (ex: WithYou)' },
                { key: 'delivery_api_key', value: apiKey, category: 'config', description: 'Clé d\'authentification de l\'API Livraison' },
                { key: 'announcement_bar_enabled', value: announcementEnabled ? 'true' : 'false', category: 'marketing', description: 'Activer la bande d\'annonce sur les produits' },
                { key: 'announcement_bar_message', value: announcementMessage, category: 'marketing', description: 'Message de la bande d\'annonce' },
                { key: 'announcement_bar_bg_color', value: announcementBgColor, category: 'marketing', description: 'Couleur de fond de la bande d\'annonce' },
                { key: 'announcement_bar_text_color', value: announcementTextColor, category: 'marketing', description: 'Couleur du texte de la bande d\'annonce' }
            ])
            setMessage('Configuration enregistrée avec succès !')
            router.refresh()
        } catch (error) {
            setMessage('Erreur lors de l\'enregistrement.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <Save className="w-4 h-4" /> API Intégration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="apiUrl" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            URL de l'API
                        </label>
                        <input
                            type="url"
                            id="apiUrl"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            placeholder="Ex: https://new.withyou.ma/api-rest"
                        />
                    </div>

                    <div>
                        <label htmlFor="apiKey" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Clé API
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            placeholder="Clé secrète"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Marketing & Annonces
                </h3>
                
                <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={announcementEnabled}
                            onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                    <span className="text-xs font-black uppercase tracking-widest text-black">
                        Activer la bande d'annonce défilante
                    </span>
                </div>

                <div>
                    <label htmlFor="announcementMessage" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                        Texte de l'annonce
                    </label>
                    <input
                        type="text"
                        id="announcementMessage"
                        value={announcementMessage}
                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                        placeholder="Ex: Livraison Gratuite dès 300 MAD !"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Couleur de fond
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                value={announcementBgColor}
                                onChange={(e) => setAnnouncementBgColor(e.target.value)}
                                className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden"
                            />
                            <input
                                type="text"
                                value={announcementBgColor}
                                onChange={(e) => setAnnouncementBgColor(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-xs font-mono"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Couleur du texte
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                value={announcementTextColor}
                                onChange={(e) => setAnnouncementTextColor(e.target.value)}
                                className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden"
                            />
                            <input
                                type="text"
                                value={announcementTextColor}
                                onChange={(e) => setAnnouncementTextColor(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-xs font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-xl shadow-black/10 disabled:opacity-50"
            >
                {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </button>
        </form>
    )
}

