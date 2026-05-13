'use client'

import { useState } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import {
    Save,
    Loader2,
    LayoutDashboard,
    Zap,
    Truck,
    Shield,
    Package,
    TrendingUp,
    Quote,
    Users,
    Sparkles,
    RefreshCw,
    FileText,
    ToggleLeft,
    ToggleRight,
    Code,
    ChevronUp,
    ChevronDown
} from 'lucide-react'

const PALETTE = [
    { name: 'Blanc', value: 'bg-white', color: '#ffffff' },
    { name: 'Crème', value: 'bg-pixio-cream', color: '#fdfcf7' },
    { name: 'Jaune', value: 'bg-pixio-yellow', color: '#fcd34d' },
    { name: 'Beige', value: 'bg-pixio-beige', color: '#f5f5dc' },
    { name: 'Gris Soft', value: 'bg-gray-50', color: '#f9fafb' },
    { name: 'Vert Soft', value: 'bg-green-50', color: '#f0fdf4' },
    { name: 'Bleu Soft', value: 'bg-blue-50', color: '#eff6ff' },
    { name: 'Orange Soft', value: 'bg-orange-50', color: '#fff7ed' },
    { name: 'Sombre', value: 'bg-black', color: '#000000' },
]

interface HomepageSectionsFormProps {
    initialSettings: Record<string, string>
}

const HOME_SECTIONS = [
    { key: 'home_section_hero', label: 'Section Hero', icon: Sparkles, defaultBg: 'bg-pixio-cream' },
    { key: 'home_section_features', label: 'Avantages (Features)', icon: Truck, defaultBg: 'bg-white' },
    { key: 'home_section_best_sellers', label: 'Meilleures Ventes', icon: TrendingUp, defaultBg: 'bg-white' },
    { key: 'home_section_quote', label: 'Citation du Jour', icon: Quote, defaultBg: 'bg-pixio-yellow' },
    { key: 'home_section_packs', label: 'Collections / Packs', icon: Package, defaultBg: 'bg-pixio-cream' },
    { key: 'home_section_authors', label: 'Auteurs Vedettes', icon: Users, defaultBg: 'bg-white' },
    { key: 'home_section_trust', label: 'Section Confiance', icon: Shield, defaultBg: 'bg-white' },
    { key: 'home_section_new_arrivals', label: 'Nouveautés', icon: Zap, defaultBg: 'bg-white' },
    { key: 'home_section_exchange', label: 'Échange de Livres', icon: RefreshCw, defaultBg: 'bg-gradient-to-br from-green-50 to-teal-50' },
    { key: 'home_section_digital', label: 'Livres Numériques', icon: FileText, defaultBg: 'bg-black' },
    { key: 'home_section_blog', label: 'Journal / Blog', icon: FileText, defaultBg: 'bg-white' },
    { key: 'home_section_custom_html', label: 'Section HTML Custom', icon: Code, defaultBg: 'bg-white' },
]

export default function HomepageSectionsForm({ initialSettings }: HomepageSectionsFormProps) {
    const [sections, setSections] = useState<Record<string, boolean>>(() => {
        const map: Record<string, boolean> = {}
        HOME_SECTIONS.forEach(s => {
            map[s.key] = initialSettings[s.key] !== 'false'
        })
        return map
    })

    const [orderedSections, setOrderedSections] = useState(() => {
        const orderStr = initialSettings['home_sections_order']
        if (orderStr) {
            const keys = orderStr.split(',')
            // Filter keys to only include those in HOME_SECTIONS and add missing ones
            const existingKeys = HOME_SECTIONS.map(s => s.key)
            const sorted = keys.filter(k => existingKeys.includes(k))
            const missing = existingKeys.filter(k => !sorted.includes(k))
            return [...sorted, ...missing].map(k => HOME_SECTIONS.find(s => s.key === k)!)
        }
        return [...HOME_SECTIONS]
    })
    const [backgrounds, setBackgrounds] = useState<Record<string, string>>(() => {
        const map: Record<string, string> = {}
        HOME_SECTIONS.forEach(s => {
            map[`bg_${s.key}`] = initialSettings[`bg_${s.key}`] || s.defaultBg
        })
        return map
    })
    const [customHtml, setCustomHtml] = useState(initialSettings['home_custom_html_content'] || '')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const toggle = (key: string) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleBgChange = (key: string, value: string) => {
        setBackgrounds(prev => ({ ...prev, [`bg_${key}`]: value }))
    }

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...orderedSections]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newOrder.length) return

        const temp = newOrder[index]
        newOrder[index] = newOrder[targetIndex]
        newOrder[targetIndex] = temp
        setOrderedSections(newOrder)
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage(null)

        const settingsArray = [
            ...HOME_SECTIONS.map(s => ({
                key: s.key,
                value: sections[s.key] ? 'true' : 'false',
                category: 'homepage_sections',
                description: `Afficher la section ${s.label}`
            })),
            ...HOME_SECTIONS.map(s => ({
                key: `bg_${s.key}`,
                value: backgrounds[`bg_${s.key}`],
                category: 'homepage_sections',
                description: `Background pour la section ${s.label}`
            })),
            {
                key: 'home_sections_order',
                value: orderedSections.map(s => s.key).join(','),
                category: 'homepage_sections',
                description: 'Ordre des sections sur la page d\'accueil'
            },
            {
                key: 'home_custom_html_content',
                value: customHtml,
                category: 'homepage_sections',
                description: 'Contenu HTML personnalisé pour l\'accueil'
            }
        ]

        const result = await updateMultipleSettings(settingsArray)

        if (result.success) {
            setMessage({ type: 'success', text: 'Sections de l\'accueil mises à jour !' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
        }

        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-black mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    Gestion des Sections (Accueil)
                </h2>
                <p className="text-sm text-gray-500 mb-8">Activez ou désactivez les blocs de contenu sur votre page d'accueil.</p>

                <div className="grid grid-cols-1 gap-6">
                    {orderedSections.map((section, index) => {
                        const Icon = section.icon
                        const isEnabled = sections[section.key]
                        const currentBg = backgrounds[`bg_${section.key}`]

                        return (
                            <div
                                key={section.key}
                                className={`flex flex-col p-6 rounded-2xl border-2 transition-all duration-200 ${isEnabled
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        {/* Reorder controls */}
                                        <div className="flex flex-col gap-1 mr-2">
                                            <button
                                                type="button"
                                                onClick={() => moveSection(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-black hover:text-white rounded-lg transition-colors disabled:opacity-10 border border-gray-100"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveSection(index, 'down')}
                                                disabled={index === orderedSections.length - 1}
                                                className="p-1 hover:bg-black hover:text-white rounded-lg transition-colors disabled:opacity-10 border border-gray-100"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-black' : 'bg-gray-100'}`}>
                                            <Icon className={`w-5 h-5 ${isEnabled ? 'text-white' : 'text-gray-400'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black ${isEnabled ? 'text-black' : 'text-gray-400'}`}>
                                                {section.label}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {isEnabled ? 'Affichée sur le site' : 'Masquée'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toggle(section.key)}
                                        className="flex items-center gap-2 flex-shrink-0 focus:outline-none"
                                    >
                                        {isEnabled
                                            ? <ToggleRight className="w-8 h-8 text-black" />
                                            : <ToggleLeft className="w-8 h-8 text-gray-300" />
                                        }
                                    </button>
                                </div>

                                {isEnabled && (
                                    <div className="space-y-3 pt-4 border-t border-gray-200/50">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            Background (Tailwind ou Hex)
                                            <div 
                                                className="w-3 h-3 rounded-full border border-gray-200" 
                                                style={{ backgroundColor: currentBg.startsWith('#') ? currentBg : '' }}
                                            />
                                        </label>
                                        <input
                                            type="text"
                                            value={currentBg}
                                            onChange={(e) => handleBgChange(section.key, e.target.value)}
                                            placeholder="ex: bg-white ou #ffffff"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                        />

                                        {/* Palette rapide */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {PALETTE.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    title={color.name}
                                                    onClick={() => handleBgChange(section.key, color.value)}
                                                    className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${currentBg === color.value ? 'ring-2 ring-black ring-offset-2 border-transparent' : 'border-gray-200'
                                                        }`}
                                                    style={{ backgroundColor: color.color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {section.key === 'home_section_custom_html' && isEnabled && (
                                    <div className="mt-6 pt-6 border-t border-gray-200/50 space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                            Code HTML / Scripts
                                        </label>
                                        <textarea
                                            value={customHtml}
                                            onChange={(e) => setCustomHtml(e.target.value)}
                                            rows={8}
                                            placeholder="<div class='custom-banner'>...</div>"
                                            className="w-full px-4 py-4 bg-gray-900 text-green-400 font-mono text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        />
                                        <p className="text-[10px] text-gray-400 italic">Attention : Le code sera injecté tel quel dans la page.</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <p className="font-bold text-sm">{message.text}</p>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
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
                            Enregistrer
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
