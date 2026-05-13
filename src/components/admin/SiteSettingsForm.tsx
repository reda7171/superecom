'use client'

import { useState, useEffect } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import { Save, Loader2, Instagram, Facebook, Twitter, Linkedin, Phone, Mail, MapPin, Image as ImageIcon, Trash2, ShoppingBag, Youtube, AtSign } from 'lucide-react'

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

    const handleDeleteLogo = () => {
        handleChange('site_logo', '')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const settingsArray = Object.entries(settings).map(([key, value]) => {
            let category = 'general'
            let description = ''

            if (key === 'site_logo') {
                category = 'general'
                description = 'Logo du site'
            } else if (key.startsWith('social_')) {
                category = 'social'
                description = `Lien ${key.replace('social_', '')}`
            } else if (key.startsWith('contact_')) {
                category = 'contact'
                description = `Contact ${key.replace('contact_', '')}`
            } else if (key === 'min_order_amount') {
                category = 'commerce'
                description = 'Montant minimum du panier'
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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (data.success && data.url) {
                handleChange('site_logo', data.url)
            } else {
                setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'upload du logo' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur réseau lors de l\'upload' })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Apparence / Logo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    Apparence
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Logo
                        </label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-3">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={settings.site_logo || ''}
                                        onChange={(e) => handleChange('site_logo', e.target.value)}
                                        placeholder="/uploads/books/logo.png ou https://..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors pr-12"
                                    />
                                    {settings.site_logo && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteLogo}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Supprimer le logo"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 hover:border-black transition-colors cursor-pointer">
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Uploader un logo
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Format recommandé : PNG avec fond transparent. Taille suggérée : 150x50px.
                                </p>
                            </div>
                            {settings.site_logo && (
                                <div className="w-24 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 p-2 relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={settings.site_logo} 
                                        alt="Aperçu du logo" 
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDeleteLogo}
                                        className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Youtube className="w-4 h-4" />
                            YouTube
                        </label>
                        <input
                            type="url"
                            value={settings.social_youtube || ''}
                            onChange={(e) => handleChange('social_youtube', e.target.value)}
                            placeholder="https://youtube.com/@riwaya"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <AtSign className="w-4 h-4" />
                            Threads
                        </label>
                        <input
                            type="url"
                            value={settings.social_threads || ''}
                            onChange={(e) => handleChange('social_threads', e.target.value)}
                            placeholder="https://threads.net/@riwaya"
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

            {/* Paramètres de la Boutique */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    Paramètres de la Boutique
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Montant Minimum Panier
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.min_order_amount || '0'}
                                onChange={(e) => handleChange('min_order_amount', e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black outline-none transition-colors pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">
                                MAD
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Le client ne pourra pas passer commande si le total est inférieur à ce montant. (0 = pas de minimum)
                        </p>
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
