'use client'

import { useState } from 'react'
import { updateSetting } from '@/lib/actions/site-settings'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PixelConfigForm({ initialPixelId }: { initialPixelId: string }) {
    const [pixelId, setPixelId] = useState(initialPixelId)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateSetting('facebook_pixel_id', pixelId, 'config', 'ID du Pixel Facebook')
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
                <label htmlFor="pixelId" className="block text-sm font-bold text-gray-900 mb-2">
                    ID du Pixel Facebook
                </label>
                <input
                    type="text"
                    id="pixelId"
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: 123456789012345"
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Vous pouvez trouver cet ID dans votre <a href="https://business.facebook.com/events_manager" target="_blank" className="text-blue-600 hover:underline">Gestionnaire d'événements Meta</a>.
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
        </form>
    )
}
