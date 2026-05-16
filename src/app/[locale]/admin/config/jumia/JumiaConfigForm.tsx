'use client'

import { useState } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import { Save, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function JumiaConfigForm({ 
    initialEnabled,
    initialEmail,
    initialApiKey,
    initialEnvironment
}: { 
    initialEnabled: boolean,
    initialEmail: string,
    initialApiKey: string,
    initialEnvironment: string
}) {
    const [enabled, setEnabled] = useState(initialEnabled)
    const [clientId, setClientId] = useState(initialEmail)
    const [refreshToken, setRefreshToken] = useState(initialApiKey)
    const [environment, setEnvironment] = useState(initialEnvironment)
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateMultipleSettings([
                { key: 'jumia_enabled', value: enabled ? 'true' : 'false', category: 'integration', description: 'Activer l\'intégration Jumia' },
                { key: 'jumia_email', value: clientId, category: 'integration', description: 'Client ID Jumia' },
                { key: 'jumia_api_key', value: refreshToken, category: 'integration', description: 'Refresh Token Jumia' },
                { key: 'jumia_environment', value: environment, category: 'integration', description: 'Environnement Jumia (sandbox ou live)' }
            ])
            setMessage('Configuration Jumia enregistrée avec succès !')
            router.refresh()
        } catch (error) {
            setMessage('Erreur lors de l\'enregistrement de la configuration.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <AlertCircle className="w-5 h-5" />
                    {message}
                </div>
            )}

            <div className="flex items-center gap-4 bg-orange-50/50 border border-orange-100 p-6 rounded-3xl">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
                <span className="text-xs font-black uppercase tracking-widest text-black">
                    Activer la synchronisation Jumia
                </span>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="clientId" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Client ID
                        </label>
                        <input
                            type="text"
                            id="clientId"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                            placeholder="Votre Client ID"
                        />
                    </div>

                    <div>
                        <label htmlFor="refreshToken" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                            Refresh Token
                        </label>
                        <input
                            type="password"
                            id="refreshToken"
                            value={refreshToken}
                            onChange={(e) => setRefreshToken(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                            placeholder="Votre Refresh Token"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                        Environnement
                    </label>
                    <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input 
                                type="radio" 
                                name="environment" 
                                value="sandbox"
                                checked={environment === 'sandbox'}
                                onChange={(e) => setEnvironment(e.target.value)}
                                className="peer sr-only"
                            />
                            <div className="p-4 text-center rounded-xl border-2 peer-checked:border-orange-500 peer-checked:bg-orange-50 text-gray-500 peer-checked:text-orange-700 font-bold text-sm transition-all">
                                Sandbox (Test)
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input 
                                type="radio" 
                                name="environment" 
                                value="live"
                                checked={environment === 'live'}
                                onChange={(e) => setEnvironment(e.target.value)}
                                className="peer sr-only"
                            />
                            <div className="p-4 text-center rounded-xl border-2 peer-checked:border-orange-500 peer-checked:bg-orange-50 text-gray-500 peer-checked:text-orange-700 font-bold text-sm transition-all">
                                Live (Production)
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-xl shadow-black/10 disabled:opacity-50"
            >
                <Save className="w-4 h-4" />
                {loading ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </button>
        </form>
    )
}
