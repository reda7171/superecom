'use client'

import { useState } from 'react'
import { updateSetting } from '@/lib/actions/site-settings'
import { Save, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ImageInjectorForm({ initialInjectedTags }: { initialInjectedTags: string }) {
    const [injectedTags, setInjectedTags] = useState(initialInjectedTags)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            await updateSetting('seo_injected_head_tags', injectedTags, 'seo', 'Balises Head Injectées (Analytics, Verification, etc.)')
            setMessage('Balises enregistrées avec succès !')
            router.refresh()
        } catch (error) {
            setMessage('Erreur lors de l\'enregistrement.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                    Outil d'injection de balises SEO avancées (meta image, robots, Google Search Console, Open Graph...).
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div>
                <label htmlFor="injectedTags" className="block text-sm font-bold text-gray-900 mb-2">
                    Balises personnalisées dans le &lt;head&gt;
                </label>
                <textarea
                    id="injectedTags"
                    value={injectedTags}
                    rows={10}
                    onChange={(e) => setInjectedTags(e.target.value)}
                    className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
                    placeholder={`<meta name="google-site-verification" content="..." />\n<meta property="og:image" content="https://..." />`}
                />
                <p className="mt-2 text-xs text-gray-500 font-medium">
                    Attention : ces balises seront injectées telles quelles sur toutes les pages du site.
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
