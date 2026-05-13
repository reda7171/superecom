'use client'

import { useState } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import { Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface FormConfigProps {
    initialData: Record<string, string>
}

export default function FormConfig({ initialData }: FormConfigProps) {
    const d = initialData
    const [form, setForm] = useState({
        form_show_email: d['form_show_email'] || 'false',
        form_require_email: d['form_require_email'] || 'false',
        form_show_address: d['form_show_address'] || 'true',
        form_require_address: d['form_require_address'] || 'true',
        form_show_city: d['form_show_city'] || 'true',
        form_require_city: d['form_require_city'] || 'true',
        form_show_note: d['form_show_note'] || 'true',
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            await updateMultipleSettings(
                Object.entries(form).map(([key, value]) => ({ key, value, category: 'form' }))
            )
            setMessage('Configuration sauvegardée avec succès !')
        } catch {
            setMessage('Erreur lors de la sauvegarde.')
        } finally {
            setLoading(false)
        }
    }

    const toggleField = (label: string, showKey: keyof typeof form, requireKey?: keyof typeof form) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
            </div>
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form[showKey] === 'true'}
                        onChange={e => update(showKey, e.target.checked ? 'true' : 'false')}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Afficher</span>
                </label>
                
                {requireKey && (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form[requireKey] === 'true'}
                            onChange={e => update(requireKey, e.target.checked ? 'true' : 'false')}
                            disabled={form[showKey] !== 'true'}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`text-sm ${form[showKey] === 'true' ? 'text-gray-600' : 'text-gray-400'}`}>Obligatoire</span>
                    </label>
                )}
            </div>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.includes('succès') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message}
                </div>
            )}

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4">Champs du Checkout (Commande COD)</h2>
                
                <div className="space-y-2">
                    <div className="flex justify-between py-4 border-b border-gray-200">
                        <p className="text-sm font-bold text-gray-800">Nom & Prénom</p>
                        <p className="text-sm text-gray-500 italic">Toujours affiché et obligatoire</p>
                    </div>
                    
                    <div className="flex justify-between py-4 border-b border-gray-200">
                        <p className="text-sm font-bold text-gray-800">Téléphone</p>
                        <p className="text-sm text-gray-500 italic">Toujours affiché et obligatoire</p>
                    </div>

                    {toggleField('Adresse Email', 'form_show_email', 'form_require_email')}
                    {toggleField('Adresse de Livraison', 'form_show_address', 'form_require_address')}
                    {toggleField('Ville', 'form_show_city', 'form_require_city')}
                    {toggleField('Note / Commentaire', 'form_show_note')}
                </div>
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
