'use client'

import { useState, useEffect } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import { Save, Loader2, Instagram, Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from 'lucide-react'

interface SettingsFormProps {
    initialSettings: Record<string, string>
}

export default function SiteSettingsForm({ initialSettings }: SettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const settingsArray = Object.entries(settings).map(([key, value]) => {
            let category = 'general'
            let description = ''

            if (key.startsWith('social_')) {
                category = 'social'
                description = `Lien ${key.replace('social_', '')}`
            } else if (key.startsWith('contact_')) {
                category = 'contact'
                description = `Contact ${key.replace('contact_', '')}`
            }

            return { key, value, category, description }
        })

        const result = await updateMultipleSettings(settingsArray)

        if (result.success) {
            setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès !' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Réseaux Sociaux */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <Instagram className="w-5 h-5 text-white" />
                    </div>
                    Réseaux Sociaux
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            Instagram
                        </label>
                        <input
                            type="url"
                            value={settings.social_instagram || ''}
                            onChange={(e) => handleChange('social_instagram', e.target.value)}
                            placeholder="https://instagram.com/riwaya"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Facebook className="w-4 h-4" />
                            Facebook
                        </label>
                        <input
                            type="url"
                            value={settings.social_facebook || ''}
                            onChange={(e) => handleChange('social_facebook', e.target.value)}
                            placeholder="https://facebook.com/riwaya"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Twitter className="w-4 h-4" />
                            Twitter / X
                        </label>
                        <input
                            type="url"
                            value={settings.social_twitter || ''}
                            onChange={(e) => handleChange('social_twitter', e.target.value)}
                            placeholder="https://twitter.com/riwaya"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={settings.social_linkedin || ''}
                            onChange={(e) => handleChange('social_linkedin', e.target.value)}
                            placeholder="https://linkedin.com/company/riwaya"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                    </div>
                    Informations de Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            value={settings.contact_phone || ''}
                            onChange={(e) => handleChange('contact_phone', e.target.value)}
                            placeholder="+212 600 000 000"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={settings.contact_email || ''}
                            onChange={(e) => handleChange('contact_email', e.target.value)}
                            placeholder="contact@riwaya.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Adresse
                        </label>
                        <input
                            type="text"
                            value={settings.contact_address || ''}
                            onChange={(e) => handleChange('contact_address', e.target.value)}
                            placeholder="Casablanca, Maroc"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            WhatsApp
                        </label>
                        <input
                            type="tel"
                            value={settings.contact_whatsapp || ''}
                            onChange={(e) => handleChange('contact_whatsapp', e.target.value)}
                            placeholder="+212 600 000 000"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Message de feedback */}
            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end">
                <button
                    type="submit"
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
                            Enregistrer les modifications
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
