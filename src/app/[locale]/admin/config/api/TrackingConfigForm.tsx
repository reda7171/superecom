'use client'

import { useState } from 'react'
import { updateSetting } from '@/lib/actions/site-settings'
import { useRouter } from 'next/navigation'
import { Facebook, Cpu, Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Music, Search, BarChart } from 'lucide-react'

interface Props {
    initialFbPixelId: string
    initialGeminiApiKey: string
    initialTiktokAccessToken: string
    initialTiktokCreatorId: string
    initialTiktokAppId: string
    initialTiktokClientSecret: string
    initialGoogleSearchConsoleId: string
    initialGoogleAnalyticsId: string
}

export default function TrackingConfigForm({ 
    initialFbPixelId, 
    initialGeminiApiKey,
    initialTiktokAccessToken,
    initialTiktokCreatorId,
    initialTiktokAppId,
    initialTiktokClientSecret,
    initialGoogleSearchConsoleId,
    initialGoogleAnalyticsId
}: Props) {
    const [fbPixelId, setFbPixelId] = useState(initialFbPixelId)
    const [geminiApiKey, setGeminiApiKey] = useState(initialGeminiApiKey)
    const [tiktokAccessToken, setTiktokAccessToken] = useState(initialTiktokAccessToken)
    const [tiktokCreatorId, setTiktokCreatorId] = useState(initialTiktokCreatorId)
    const [tiktokAppId, setTiktokAppId] = useState(initialTiktokAppId)
    const [tiktokClientSecret, setTiktokClientSecret] = useState(initialTiktokClientSecret)
    const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState(initialGoogleSearchConsoleId)
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState(initialGoogleAnalyticsId)
    
    const [showApiKey, setShowApiKey] = useState(false)
    const [showTiktokToken, setShowTiktokToken] = useState(false)
    const [showTiktokSecret, setShowTiktokSecret] = useState(false)
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            await updateSetting('facebook_pixel_id', fbPixelId, 'tracking', 'Facebook Pixel ID')
            await updateSetting('gemini_api_key', geminiApiKey, 'api', 'Gemini AI API Key')
            await updateSetting('tiktok_access_token', tiktokAccessToken, 'api', 'TikTok Access Token')
            await updateSetting('tiktok_creator_id', tiktokCreatorId, 'api', 'TikTok Creator ID')
            await updateSetting('tiktok_app_id', tiktokAppId, 'api', 'TikTok App ID')
            await updateSetting('tiktok_client_secret', tiktokClientSecret, 'api', 'TikTok Client Secret')
            await updateSetting('google_search_console_id', googleSearchConsoleId, 'tracking', 'Google Search Console Verification ID')
            await updateSetting('google_analytics_id', googleAnalyticsId, 'tracking', 'Google Analytics Measurement ID')

            setMessage({ type: 'success', text: 'Configuration enregistrée avec succès !' })
            router.refresh()
        } catch (err) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {/* Facebook Pixel Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Facebook className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">Facebook Pixel</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            Pixel ID
                        </label>
                        <input
                            type="text"
                            value={fbPixelId}
                            onChange={(e) => setFbPixelId(e.target.value)}
                            placeholder="Ex: 904723299078048"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
                        />
                        <p className="mt-2 text-[11px] text-gray-400 font-medium ml-1 italic">
                            Identifiant unique utilisé pour le suivi des événements sur Facebook.
                        </p>
                    </div>
                </div>
            </div>

            {/* Gemini AI Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">Gemini AI</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            Clé d'API Google Gemini
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm pr-14"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] text-gray-400 font-medium ml-1 italic">
                            Nécessaire pour le ChatBot et la génération de contenu (Packs, Descriptions).
                        </p>
                    </div>
                </div>
            </div>

            {/* TikTok Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">TikTok Business</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            Client Key (App ID)
                        </label>
                        <input
                            type="text"
                            value={tiktokAppId}
                            onChange={(e) => setTiktokAppId(e.target.value)}
                            placeholder="aw0if..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-bold text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            Client Secret
                        </label>
                        <div className="relative">
                            <input
                                type={showTiktokSecret ? "text" : "password"}
                                value={tiktokClientSecret}
                                onChange={(e) => setTiktokClientSecret(e.target.value)}
                                placeholder="lqzB..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-mono text-sm pr-14"
                            />
                            <button
                                type="button"
                                onClick={() => setShowTiktokSecret(!showTiktokSecret)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-slate-900 transition-colors"
                            >
                                {showTiktokSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            Access Token
                        </label>
                        <div className="relative">
                            <input
                                type={showTiktokToken ? "text" : "password"}
                                value={tiktokAccessToken}
                                onChange={(e) => setTiktokAccessToken(e.target.value)}
                                placeholder="act..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-mono text-sm pr-14"
                            />
                            <button
                                type="button"
                                onClick={() => setShowTiktokToken(!showTiktokToken)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-slate-900 transition-colors"
                            >
                                {showTiktokToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            Creator ID (Open ID)
                        </label>
                        <input
                            type="text"
                            value={tiktokCreatorId}
                            onChange={(e) => setTiktokCreatorId(e.target.value)}
                            placeholder="7000..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all font-bold text-gray-900"
                        />
                    </div>
                </div>
                <p className="mt-4 text-[11px] text-gray-400 font-medium ml-1 italic">
                    Utilisé par n8n pour authentifier les requêtes de publication sur TikTok.
                </p>
            </div>

            {/* Google Search Console Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                        <Search className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">Google Search Console</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            ID de vérification (Meta Tag content)
                        </label>
                        <input
                            type="text"
                            value={googleSearchConsoleId}
                            onChange={(e) => setGoogleSearchConsoleId(e.target.value)}
                            placeholder="Ex: wE-mZ_..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-bold text-gray-900"
                        />
                        <p className="mt-2 text-[11px] text-gray-400 font-medium ml-1 italic">
                            Copiez ici uniquement la valeur de l'attribut 'content' de la balise meta de vérification HTML fournie par Google.
                        </p>
                    </div>
                </div>
            </div>

            {/* Google Analytics Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                        <BarChart className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">Google Analytics (GA4)</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-black text-gray-700 uppercase tracking-wider mb-2 ml-1">
                            ID de mesure (Measurement ID)
                        </label>
                        <input
                            type="text"
                            value={googleAnalyticsId}
                            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                            placeholder="Ex: G-XXXXXXXXXX"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold text-gray-900"
                        />
                        <p className="mt-2 text-[11px] text-gray-400 font-medium ml-1 italic">
                            L'identifiant de mesure GA4 commence généralement par 'G-'.
                        </p>
                    </div>
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    disabled={loading}
                    className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm transition-all hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-gray-200"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    ENREGISTRER LA CONFIGURATION
                </button>
            </div>
        </form>
    )
}
