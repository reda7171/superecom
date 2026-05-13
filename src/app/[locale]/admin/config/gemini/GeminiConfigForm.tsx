'use client'

import { useState } from 'react'
import { updateSetting } from '@/lib/actions/site-settings'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GeminiConfigForm({ initialApiKey }: { initialApiKey: string }) {
    const [apiKey, setApiKey] = useState(initialApiKey)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateSetting('gemini_api_key', apiKey, 'config', 'Gemini API Key')
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
                <label htmlFor="apiKey" className="block text-sm font-bold text-gray-900 mb-2">
                    Clé API Gemini (API Key)
                </label>
                <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="AIzaSy..."
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Cette clé sera utilisée pour générer du contenu, traduire, etc.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>

            <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h3 className="text-purple-900 font-bold flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs">?</span>
                    Comment obtenir une clé API ?
                </h3>
                <ul className="space-y-3 text-sm text-purple-800/80">
                    <li className="flex gap-2">
                        <span className="font-bold text-purple-900">1.</span>
                        <span>Rendez-vous sur <strong>Google AI Studio</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-purple-900">2.</span>
                        <span>Connectez-vous avec votre compte Google.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-purple-900">3.</span>
                        <span>Cliquez sur "Get API Key" puis "Create API Key".</span>
                    </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-purple-100 flex justify-between items-center">
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase tracking-wider text-purple-600 hover:text-purple-700 underline"
                    >
                        Ouvrir Google AI Studio →
                    </a>
                </div>
            </div>
        </form>
    )
}
