'use client'

import { useState } from 'react'
import { Save, Banknote, AlertCircle, RefreshCw } from 'lucide-react'
import { updateSetting } from '@/lib/actions/site-settings'
import { useUIStore } from '@/store/ui'

interface AdsenseSettings {
    enabled: boolean
    publisherId: string
    slotArticleTop: string
    slotArticleBottom: string
    slotSidebar: string
    slotBetweenBooks: string
}

export default function AdsenseConfigForm({ initialSettings }: { initialSettings: AdsenseSettings }) {
    const [settings, setSettings] = useState<AdsenseSettings>(initialSettings)
    const [isLoading, setIsLoading] = useState(false)
    const showNotification = useUIStore(state => state.showNotification)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await updateSetting('adsense_enabled', String(settings.enabled), 'config', 'Activer Google AdSense')
            await updateSetting('adsense_publisher_id', settings.publisherId, 'config', 'ID Éditeur AdSense')
            await updateSetting('adsense_slot_article_top', settings.slotArticleTop, 'config', 'Slot Haut Article')
            await updateSetting('adsense_slot_article_bottom', settings.slotArticleBottom, 'config', 'Slot Bas Article')
            await updateSetting('adsense_slot_sidebar', settings.slotSidebar, 'config', 'Slot Sidebar')
            await updateSetting('adsense_slot_between_books', settings.slotBetweenBooks, 'config', 'Slot Entre les livres')
            
            showNotification('Configuration AdSense mise à jour avec succès', 'success')
        } catch (error) {
            console.error('Erreur lors de la mise à jour AdSense:', error)
            showNotification('Erreur lors de la mise à jour', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Configuration AdSense</h2>
                        <p className="text-sm text-slate-500">Gérez vos identifiants et les emplacements de vos publicités.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <input
                        type="checkbox"
                        id="enabled"
                        checked={settings.enabled}
                        onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="enabled" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Activer les publicités Google AdSense sur le site
                    </label>
                </div>

                {settings.enabled && (
                    <div className="grid grid-cols-1 gap-6 pt-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                ID Éditeur (Publisher ID)
                            </label>
                            <input
                                type="text"
                                value={settings.publisherId}
                                onChange={(e) => setSettings({ ...settings, publisherId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                placeholder="Ex: pub-1234567890123456"
                            />
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Requis pour activer AdSense. Se trouve dans votre compte Google AdSense.
                            </p>
                        </div>

                        <div className="border-t border-slate-100 pt-6 mt-2">
                            <h3 className="text-md font-black text-slate-900 mb-4">Emplacements des blocs d'annonces (Slot ID)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Haut de l'article (Journal)
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.slotArticleTop}
                                        onChange={(e) => setSettings({ ...settings, slotArticleTop: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        placeholder="Ex: 1234567890"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Identifiant du bloc (data-ad-slot)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Bas de l'article (Journal)
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.slotArticleBottom}
                                        onChange={(e) => setSettings({ ...settings, slotArticleBottom: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        placeholder="Ex: 0987654321"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Barre latérale (Sidebar / Liste)
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.slotSidebar}
                                        onChange={(e) => setSettings({ ...settings, slotSidebar: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        placeholder="Ex: 5678901234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Entre les livres (Catalogue)
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.slotBetweenBooks}
                                        onChange={(e) => setSettings({ ...settings, slotBetweenBooks: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                        placeholder="Ex: 9988776655"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-black/10"
                >
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
                </button>
            </div>
        </form>
    )
}
