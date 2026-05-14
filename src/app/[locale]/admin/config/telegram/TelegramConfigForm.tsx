'use client'

import { useState } from 'react'
import { updateSetting } from '@/lib/actions/site-settings'
import { Save, Send, Webhook, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
    initialBotToken: string
    initialChatId: string
    appUrl: string
    initialSettings: {
        notifyOrders: boolean
        notifyHomeVisit: boolean
        notifySearch: boolean
        notifyCart: boolean
        notifyRegister: boolean
        notifyChat: boolean
        notifyLowStock: boolean
        notifyDailySummary: boolean
        notifyReviews: boolean
    }
}

export default function TelegramConfigForm({ initialBotToken, initialChatId, appUrl, initialSettings }: Props) {
    const [botToken, setBotToken] = useState(initialBotToken)
    const [chatId, setChatId] = useState(initialChatId)
    const [settings, setSettings] = useState(initialSettings)
    const [loading, setLoading] = useState(false)
    const [testLoading, setTestLoading] = useState(false)
    const [webhookLoading, setWebhookLoading] = useState(false)
    const [customAppUrl, setCustomAppUrl] = useState(appUrl)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            await updateSetting('telegram_bot_token', botToken, 'config', 'Telegram Bot Token')
            await updateSetting('telegram_chat_id', chatId, 'config', 'Telegram Chat ID')
            
            // Sauvegarder les paramètres de notification
            await updateSetting('telegram_notify_orders', String(settings.notifyOrders), 'config', 'Notif Commandes')
            await updateSetting('telegram_notify_home_visit', String(settings.notifyHomeVisit), 'config', 'Notif Visite Accueil')
            await updateSetting('telegram_notify_search', String(settings.notifySearch), 'config', 'Notif Recherche')
            await updateSetting('telegram_notify_cart', String(settings.notifyCart), 'config', 'Notif Panier')
            await updateSetting('telegram_notify_register', String(settings.notifyRegister), 'config', 'Notif Inscription')
            await updateSetting('telegram_notify_chat', String(settings.notifyChat), 'config', 'Notif ChatBot')
            await updateSetting('telegram_notify_low_stock', String(settings.notifyLowStock), 'config', 'Notif Stock Faible')
            await updateSetting('telegram_notify_daily_summary', String(settings.notifyDailySummary), 'config', 'Résumé Journalier')
            await updateSetting('telegram_notify_reviews', String(settings.notifyReviews), 'config', 'Notif Avis Clients')

            setMessage('Configuration enregistrée avec succès !')
            router.refresh()
        } catch {
            setMessage('Erreur lors de l\'enregistrement.')
        } finally {
            setLoading(false)
        }
    }

    async function handleTest() {
        setTestLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/telegram/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botToken, chatId })
            })
            const data = await res.json()
            setMessage(data.ok ? '✅ Message de test envoyé sur Telegram !' : `❌ Erreur : ${data.error}`)
        } catch {
            setMessage('❌ Impossible d\'envoyer le message de test.')
        } finally {
            setTestLoading(false)
        }
    }

    async function handleSetWebhook() {
        setWebhookLoading(true)
        setMessage('')
        try {
            const webhookUrl = `${customAppUrl.replace(/\/$/, '')}/api/webhooks/telegram`
            const res = await fetch('/api/telegram/set-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botToken, webhookUrl })
            })
            const data = await res.json()
            setMessage(data.ok ? `✅ Webhook configuré : ${webhookUrl}` : `❌ Erreur : ${data.error || data.description || 'Réponse invalide du serveur'}`)
        } catch {
            setMessage('❌ Erreur lors de la configuration du webhook.')
        } finally {
            setWebhookLoading(false)
        }
    }

    const isSuccess = message.startsWith('✅') || message.includes('succès')
    const isError = message.startsWith('❌') || message.includes('Erreur')

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div>
                <label htmlFor="botToken" className="block text-sm font-bold text-gray-900 mb-2">
                    Bot Token
                </label>
                <input
                    type="password"
                    id="botToken"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwXYz..."
                />
                <p className="mt-1 text-xs text-gray-500">Obtenu via @BotFather sur Telegram</p>
            </div>

            <div>
                <label htmlFor="chatId" className="block text-sm font-bold text-gray-900 mb-2">
                    Chat ID
                </label>
                <input
                    type="text"
                    id="chatId"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="-1001234567890"
                />
                <p className="mt-1 text-xs text-gray-500">ID du groupe ou channel. Utilisez @userinfobot pour le trouver.</p>
            </div>

            <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                <label htmlFor="webhookUrl" className="block text-sm font-bold text-yellow-900 mb-2">
                    URL de base pour Webhook (HTTPS requis)
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="webhookUrl"
                        value={customAppUrl}
                        onChange={(e) => setCustomAppUrl(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-yellow-200 focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                        placeholder="https://votre-ngrok.ngrok-free.app"
                    />
                </div>
                <p className="mt-2 text-[10px] text-yellow-700 font-bold uppercase italic">
                    Pour le développement local, utilisez votre URL ngrok ci-dessus.
                </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-black text-black mb-6">Notifications actives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { id: 'notifyOrders', label: 'Nouvelles commandes', desc: 'Alertes lors d\'une commande client' },
                        { id: 'notifyRegister', label: 'Nouvelles inscriptions', desc: 'Alertes lors de la création d\'un compte' },
                        { id: 'notifyCart', label: 'Ajout au panier', desc: 'Alertes quand un client remplit son panier' },
                        { id: 'notifyChat', label: 'ChatBot (IA)', desc: 'Alertes lors des discussions avec l\'assistant' },
                        { id: 'notifyReviews', label: 'Avis Clients', desc: 'Modération des avis avec boutons Approuver/Supprimer' },
                        { id: 'notifyLowStock', label: 'Alerte Stock Faible', desc: 'Alertes si un livre passe sous 3 unités' },
                        { id: 'notifyDailySummary', label: 'Résumé Journalier', desc: 'Récapitulatif des ventes chaque soir à 22h' },
                        { id: 'notifyHomeVisit', label: 'Visite Accueil', desc: 'Alertes quand quelqu\'un arrive sur le site' },
                        { id: 'notifySearch', label: 'Recherches & Filtres', desc: 'Alertes lors de recherches dans le catalogue' },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:border-blue-100 group">
                            <div className="flex-1 pr-6">
                                <p className="text-[13px] font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.label}</p>
                                <p className="text-[11px] text-gray-400 font-bold mt-0.5 leading-tight">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={(settings as any)[item.id]}
                                    onChange={(e) => setSettings({ ...settings, [item.id]: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                </button>

                <button
                    type="button"
                    onClick={handleTest}
                    disabled={testLoading || !botToken || !chatId}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Tester
                </button>

                <button
                    type="button"
                    onClick={handleSetWebhook}
                    disabled={webhookLoading || !botToken}
                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {webhookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
                    Configurer Webhook
                </button>
            </div>

            {/* Guide */}
            <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="text-blue-900 font-bold mb-3">Comment configurer le bot ?</h3>
                <ol className="space-y-2 text-sm text-blue-800/80 list-none">
                    <li className="flex gap-2"><span className="font-bold text-blue-900">1.</span> Ouvrez Telegram et cherchez <strong>@BotFather</strong></li>
                    <li className="flex gap-2"><span className="font-bold text-blue-900">2.</span> Envoyez <code className="bg-blue-100 px-1 rounded">/newbot</code> et suivez les instructions</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-900">3.</span> Copiez le token fourni et collez-le ci-dessus</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-900">4.</span> Ajoutez le bot à votre groupe/channel admin</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-900">5.</span> Utilisez <strong>@userinfobot</strong> pour obtenir le Chat ID</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-900">6.</span> Enregistrez, puis cliquez <strong>Configurer Webhook</strong></li>
                </ol>
            </div>
        </form>
    )
}
