'use client'

import { useState } from 'react'
import { updateSetting } from '@/lib/actions/site-settings'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function N8nConfigForm({ initialWebhookUrl, initialInstagramWebhookUrl, initialFacebookAccessToken, initialInstagramAccountId, initialInstagramToken }: { initialWebhookUrl: string, initialInstagramWebhookUrl: string, initialFacebookAccessToken: string, initialInstagramAccountId: string, initialInstagramToken: string }) {
    const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl)
    const [instagramWebhookUrl, setInstagramWebhookUrl] = useState(initialInstagramWebhookUrl)
    const [facebookAccessToken, setFacebookAccessToken] = useState(initialFacebookAccessToken)
    const [instagramAccountId, setInstagramAccountId] = useState(initialInstagramAccountId)
    const [instagramToken, setInstagramToken] = useState(initialInstagramToken)
    const [loading, setLoading] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateSetting('n8n_webhook_url', webhookUrl, 'config', 'URL du Webhook n8n')
            await updateSetting('n8n_instagram_webhook_url', instagramWebhookUrl, 'config', 'URL du Webhook Instagram')
            await updateSetting('facebook_access_token', facebookAccessToken, 'config', 'Facebook Access Token')
            await updateSetting('instagram_account_id', instagramAccountId, 'config', 'Instagram Account ID')
            await updateSetting('instagram_token', instagramToken, 'config', 'Instagram Token')
            setMessage('Configuration enregistrée avec succès !')
            router.refresh()
        } catch (error) {
            setMessage('Erreur lors de l\'enregistrement.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div>
                <label htmlFor="webhookUrl" className="block text-sm font-bold text-gray-900 mb-2">
                    URL du Webhook (n8n)
                </label>
                <input
                    type="url"
                    id="webhookUrl"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: https://n8n.votredomaine.com/webhook/..."
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Cette URL sera appelée lors d'événements importants (nouvelle commande, etc.)
                </p>
            </div>

            <div>
                <label htmlFor="instagramWebhookUrl" className="block text-sm font-bold text-gray-900 mb-2">
                    URL du Webhook Instagram (n8n)
                </label>
                <input
                    type="url"
                    id="instagramWebhookUrl"
                    value={instagramWebhookUrl}
                    onChange={(e) => setInstagramWebhookUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: https://n8n.votredomaine.com/webhook/instagram..."
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Ce webhook sera appelé pour déclencher une publication sur Instagram.
                </p>
            </div>

            <div>
                <label htmlFor="facebookAccessToken" className="block text-sm font-bold text-gray-900 mb-2">
                    Facebook Access Token
                </label>
                <textarea
                    id="facebookAccessToken"
                    value={facebookAccessToken}
                    onChange={(e) => setFacebookAccessToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                    placeholder="Entrez le jeton d'accès Facebook..."
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Utilisé pour les automatisations liées à Facebook (Pixel, Conversion API, etc.)
                </p>
            </div>

            <div>
                <label htmlFor="instagramAccountId" className="block text-sm font-bold text-gray-900 mb-2">
                    Instagram Account ID (ig_user_id)
                </label>
                <input
                    type="text"
                    id="instagramAccountId"
                    value={instagramAccountId}
                    onChange={(e) => setInstagramAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: 17841400000000000"
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    L'ID du compte pro Instagram lié à la page Facebook. Nécessaire pour publier sur Instagram.
                </p>
            </div>

            <div>
                <label htmlFor="instagramToken" className="block text-sm font-bold text-gray-900 mb-2">
                    Instagram Token
                </label>
                <textarea
                    id="instagramToken"
                    value={instagramToken}
                    onChange={(e) => setInstagramToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                    placeholder="Entrez le jeton Instagram..."
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Jeton d'accès pour interagir avec l'API Instagram.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={loading || isTesting}
                    className="flex-1 sm:flex-none px-8 py-3 bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                
                <button
                    type="button"
                    disabled={isTesting || !instagramWebhookUrl || !instagramToken || !instagramAccountId}
                    onClick={async () => {
                        setIsTesting(true)
                        setMessage('')
                        try {
                            const res = await fetch(instagramWebhookUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'test_instagram',
                                    token: instagramToken,
                                    account_id: instagramAccountId
                                })
                            })
                            if (res.ok) {
                                setMessage('Test envoyé avec succès !')
                            } else {
                                setMessage('Erreur lors du test du webhook.')
                            }
                        } catch (e) {
                            setMessage('Erreur réseau lors du test.')
                        } finally {
                            setIsTesting(false)
                        }
                    }}
                    className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isTesting ? 'Test en cours...' : 'Tester la publication IG'}
                </button>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">?</span>
                    Guide : Comment obtenir le bon jeton ?
                </h3>
                <ul className="space-y-3 text-sm text-blue-800/80">
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-900">1.</span>
                        <span>Utilisez un <strong>Page Access Token</strong> (et non un User Token).</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-900">2.</span>
                        <span>Permissions obligatoires : <code className="bg-blue-100 px-1 rounded">pages_manage_posts</code>, <code className="bg-blue-100 px-1 rounded">pages_read_engagement</code> et <code className="bg-blue-100 px-1 rounded">pages_show_list</code>.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-900">3.</span>
                        <span>Générez un jeton de <strong>longue durée</strong> via le Graph API Explorer pour éviter l'expiration.</span>
                    </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                    <a 
                        href="https://developers.facebook.com/tools/explorer/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 underline"
                    >
                        Ouvrir Facebook Explorer →
                    </a>
                </div>
            </div>
        </form>
    )
}
