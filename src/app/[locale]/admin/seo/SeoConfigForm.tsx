'use client'

import { useState } from 'react'
import { updateMultipleSettings } from '@/lib/actions/site-settings'
import {
    Save, Globe, Image as ImageIcon, Key, Map, Eye, Share2,
    CheckCircle2, AlertCircle, Tag, BarChart3, Link, Shield, Smartphone, Loader2, Sparkles
} from 'lucide-react'

interface SeoExpertFormProps {
    initialData: Record<string, string>
}

const SECTIONS = ['identity', 'og', 'verification', 'technical', 'social', 'analytics', 'advanced'] as const
type Section = typeof SECTIONS[number]

const sectionLabels: Record<Section, { label: string; icon: any }> = {
    identity: { label: 'Identité principale', icon: Globe },
    og: { label: 'Open Graph / Social', icon: ImageIcon },
    verification: { label: 'Vérifications Webmaster', icon: Key },
    technical: { label: 'Technique & Robots', icon: Shield },
    social: { label: 'Réseaux sociaux', icon: Share2 },
    analytics: { label: 'Analytics & Tracking', icon: BarChart3 },
    advanced: { label: 'Avancé', icon: Link },
}

export default function SeoConfigForm({ initialData }: SeoExpertFormProps) {
    const d = initialData
    const [form, setForm] = useState({
        // Identité
        seo_default_title: d['seo_default_title'] || '',
        seo_default_description: d['seo_default_description'] || '',
        seo_default_keywords: d['seo_default_keywords'] || '',
        seo_canonical_url: d['seo_canonical_url'] || 'https://superEcom.store',
        seo_site_name: d['seo_site_name'] || 'SuperEcom',
        seo_author: d['seo_author'] || 'SuperEcom Team',
        seo_language: d['seo_language'] || 'fr-MA',
        // Open Graph
        seo_og_image: d['seo_og_image'] || '',
        seo_og_image_width: d['seo_og_image_width'] || '1200',
        seo_og_image_height: d['seo_og_image_height'] || '630',
        seo_og_image_alt: d['seo_og_image_alt'] || 'SuperEcom - Librairie en ligne au Maroc',
        seo_og_type: d['seo_og_type'] || 'website',
        seo_og_locale: d['seo_og_locale'] || 'fr_MA',
        seo_twitter_handle: d['seo_twitter_handle'] || '@riwaya_ma',
        seo_twitter_card: d['seo_twitter_card'] || 'summary_large_image',
        seo_twitter_image: d['seo_twitter_image'] || '',
        // Vérifications
        seo_google_verification: d['seo_google_verification'] || '',
        seo_bing_verification: d['seo_bing_verification'] || '',
        seo_yandex_verification: d['seo_yandex_verification'] || '',
        seo_pinterest_verification: d['seo_pinterest_verification'] || '',
        // Technique
        seo_favicon_url: d['seo_favicon_url'] || '/favicon.ico',
        seo_robots_txt: d['seo_robots_txt'] || 'User-agent: *\nAllow: /\nSitemap: https://superEcom.store/sitemap.xml',
        seo_robots_meta: d['seo_robots_meta'] || 'index, follow',
        seo_viewport: d['seo_viewport'] || 'width=device-width, initial-scale=1',
        seo_theme_color: d['seo_theme_color'] || '#000000',
        // Réseaux sociaux
        seo_facebook_page: d['seo_facebook_page'] || '',
        seo_instagram_handle: d['seo_instagram_handle'] || '',
        seo_youtube_channel: d['seo_youtube_channel'] || '',
        seo_tiktok_handle: d['seo_tiktok_handle'] || '',
        // Analytics
        seo_google_analytics_id: d['seo_google_analytics_id'] || '',
        seo_gtm_id: d['seo_gtm_id'] || '',
        seo_hotjar_id: d['seo_hotjar_id'] || '',
        seo_clarity_id: d['seo_clarity_id'] || '',
        // Avancé
        seo_schema_org_type: d['seo_schema_org_type'] || 'OnlineStore',
        seo_price_range: d['seo_price_range'] || '50 MAD - 300 MAD',
        seo_address_city: d['seo_address_city'] || 'Casablanca',
        seo_address_country: d['seo_address_country'] || 'MA',
        seo_contact_phone: d['seo_contact_phone'] || '',
        seo_contact_email: d['seo_contact_email'] || '',
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [openSection, setOpenSection] = useState<Section>('identity')

    const [isGeneratingTitleFR, setIsGeneratingTitleFR] = useState(false)
    const [isGeneratingTitleAR, setIsGeneratingTitleAR] = useState(false)
    const [isGeneratingDescFR, setIsGeneratingDescFR] = useState(false)
    const [isGeneratingDescAR, setIsGeneratingDescAR] = useState(false)
    const [isGeneratingKeywordsFR, setIsGeneratingKeywordsFR] = useState(false)
    const [isGeneratingKeywordsAR, setIsGeneratingKeywordsAR] = useState(false)

    const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            const res = await updateMultipleSettings(
                Object.entries(form).map(([key, value]) => ({ key, value, category: 'seo' }))
            )
            if (res.success) {
                setMessage('Configuration SEO sauvegardée avec succès !')
            } else {
                setMessage(`Erreur lors de la sauvegarde : ${res.error}`)
            }
        } catch {
            setMessage('Erreur lors de la sauvegarde.')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateSiteSeo = async (fieldToGen: 'title' | 'description' | 'keywords', lang: 'fr' | 'ar') => {
        let setGenerating;
        let prompt = '';
        if (fieldToGen === 'title') {
            setGenerating = lang === 'fr' ? setIsGeneratingTitleFR : setIsGeneratingTitleAR;
            prompt = lang === 'fr'
                ? "Propose un Meta Title SEO très accrocheur (max 60 caractères) pour la page d'accueil d'une librairie en ligne au Maroc nommée SuperEcom. Ne donne que le titre sans guillemets."
                : "اقترح عنوان Meta Title جذاب جدا (بحد أقصى 60 حرفًا) للصفحة الرئيسية لمكتبة إلكترونية في المغرب تسمى SuperEcom. أعطني العنوان فقط بدون علامات تنصيص.";
        } else if (fieldToGen === 'description') {
            setGenerating = lang === 'fr' ? setIsGeneratingDescFR : setIsGeneratingDescAR;
            prompt = lang === 'fr'
                ? "Rédige une Meta Description SEO persuasive (max 160 caractères) pour la page d'accueil d'une librairie en ligne au Maroc nommée SuperEcom. Ne donne que la description sans guillemets."
                : "اكتب وصف Meta Description مقنع (بحد أقصى 160 حرفًا) للصفحة الرئيسية لمكتبة إلكترونية في المغرب تسمى SuperEcom. أعطني الوصف فقط بدون علامات تنصيص.";
        } else if (fieldToGen === 'keywords') {
            setGenerating = lang === 'fr' ? setIsGeneratingKeywordsFR : setIsGeneratingKeywordsAR;
            prompt = lang === 'fr'
                ? "Génère 10 à 15 mots-clés SEO pertinents (séparés par des virgules) pour une librairie en ligne au Maroc nommée SuperEcom. Ne donne que les mots-clés."
                : "قم بتوليد 10 إلى 15 كلمة مفتاحية SEO ذات صلة (مفصولة بفواصل) لمكتبة إلكترونية في المغرب تسمى SuperEcom. أعطني الكلمات المفتاحية فقط.";
        }

        if (!setGenerating) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.text) {
                const cleanText = data.text.replace(/["'*]/g, '').trim();
                if (fieldToGen === 'title') update('seo_default_title', cleanText);
                if (fieldToGen === 'description') update('seo_default_description', cleanText);
                if (fieldToGen === 'keywords') update('seo_default_keywords', cleanText);
            }
        } catch (err) {
            console.error(err);
        }
        setGenerating(false);
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string) => {
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
                update(targetKey, data.url)
            } else {
                setMessage('Erreur lors de l\'upload de l\'image')
            }
        } catch (error) {
            setMessage('Erreur réseau lors de l\'upload')
        }
    }

    const titleLen = form.seo_default_title.length
    const descLen = form.seo_default_description.length

    const input = (key: keyof typeof form, placeholder: string, type = 'text') => (
        <input
            type={type}
            value={form[key]}
            onChange={e => update(key, e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            placeholder={placeholder}
        />
    )

    const field = (label: string, key: keyof typeof form, placeholder: string, type = 'text', hint?: string) => (
        <div key={key}>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">{label}</label>
            {input(key, placeholder, type)}
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    )

    const SectionHeader = ({ s }: { s: Section }) => {
        const { label, icon: Icon } = sectionLabels[s]
        const isOpen = openSection === s
        return (
            <button
                type="button"
                onClick={() => setOpenSection(isOpen ? s : s)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all border ${isOpen ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-sm font-black uppercase tracking-widest">{label}</span>
                </div>
                <span className={`text-lg ${isOpen ? 'text-white' : 'text-gray-400'}`}>{isOpen ? '−' : '+'}</span>
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.includes('succès') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message}
                </div>
            )}

            {/* Aperçu SERP */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Aperçu Google (SERP)
                </p>
                <div className="max-w-lg">
                    <p className="text-[11px] text-gray-400 mb-1">{form.seo_canonical_url || 'https://superEcom.store'}</p>
                    <p className="text-lg font-medium text-blue-700 leading-tight line-clamp-1">{form.seo_default_title || 'Titre de votre site'}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-snug line-clamp-2">{form.seo_default_description || 'Description...'}</p>
                </div>
            </div>

            {/* 1 — Identité principale */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="identity" />
                {openSection === 'identity' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Meta Title</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateSiteSeo('title', 'fr')}
                                        disabled={isGeneratingTitleFR}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isGeneratingTitleFR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} FR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateSiteSeo('title', 'ar')}
                                        disabled={isGeneratingTitleAR}
                                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isGeneratingTitleAR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AR
                                    </button>
                                    <span className={`text-xs font-bold ml-2 ${titleLen > 60 ? 'text-red-500' : titleLen > 50 ? 'text-orange-500' : 'text-green-600'}`}>{titleLen}/60</span>
                                </div>
                            </div>
                            {input('seo_default_title', 'SuperEcom - Librairie en ligne au Maroc')}
                        </div>
                        <div className="sm:col-span-2">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Meta Description</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateSiteSeo('description', 'fr')}
                                        disabled={isGeneratingDescFR}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isGeneratingDescFR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} FR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateSiteSeo('description', 'ar')}
                                        disabled={isGeneratingDescAR}
                                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isGeneratingDescAR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AR
                                    </button>
                                    <span className={`text-xs font-bold ml-2 ${descLen > 160 ? 'text-red-500' : descLen > 140 ? 'text-orange-500' : 'text-green-600'}`}>{descLen}/160</span>
                                </div>
                            </div>
                            <textarea
                                rows={3}
                                value={form.seo_default_description}
                                onChange={e => update('seo_default_description', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                placeholder="Découvrez SuperEcom, la librairie en ligne n°1 au Maroc..."
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Mots-clés (Keywords)</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateSiteSeo('keywords', 'fr')}
                                        disabled={isGeneratingKeywordsFR}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isGeneratingKeywordsFR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} FR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateSiteSeo('keywords', 'ar')}
                                        disabled={isGeneratingKeywordsAR}
                                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
                                    >
                                        {isGeneratingKeywordsAR ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AR
                                    </button>
                                </div>
                            </div>
                            {input('seo_default_keywords', 'livres, maroc, librairie, achat')}
                            <p className="text-xs text-gray-400 mt-1">Séparés par des virgules</p>
                        </div>
                        {field('URL Canonique', 'seo_canonical_url', 'https://superEcom.store', 'url')}
                        {field('Nom du site', 'seo_site_name', 'SuperEcom')}
                        {field('Auteur', 'seo_author', 'SuperEcom Team')}
                        {field('Langue principale', 'seo_language', 'fr-MA', 'text', 'Ex: fr-MA, ar-MA, en-US')}
                    </div>
                )}
            </div>

            {/* 2 — Open Graph */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="og" />
                {openSection === 'og' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">Image OG (URL — 1200×630px)</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="url"
                                        value={form.seo_og_image}
                                        onChange={e => update('seo_og_image', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                        placeholder="https://superEcom.store/og-image.jpg"
                                    />
                                    <div className="relative mt-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'seo_og_image')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 hover:border-black transition-colors cursor-pointer">
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Uploader une Image OG
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Affichée sur Facebook, WhatsApp, LinkedIn, etc.</p>
                                </div>
                                {form.seo_og_image && (
                                    <div className="w-40 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 p-1 relative group">
                                        <img src={form.seo_og_image} className="max-w-full max-h-full object-contain" alt="OG Preview" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {field('Alt Image OG', 'seo_og_image_alt', 'SuperEcom - Librairie en ligne au Maroc')}
                        {field('Image Twitter', 'seo_twitter_image', 'https://superEcom.store/twitter-image.jpg', 'url')}
                        {field('OG Type', 'seo_og_type', 'website', 'text', 'website, product, article...')}
                        {field('OG Locale', 'seo_og_locale', 'fr_MA')}
                        {field('Largeur image OG (px)', 'seo_og_image_width', '1200')}
                        {field('Hauteur image OG (px)', 'seo_og_image_height', '630')}
                        {field('Handle Twitter', 'seo_twitter_handle', '@riwaya_ma')}
                        <div>
                            <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">Twitter Card</label>
                            <select
                                value={form.seo_twitter_card}
                                onChange={e => update('seo_twitter_card', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            >
                                <option value="summary_large_image">summary_large_image (grande image)</option>
                                <option value="summary">summary (petite image)</option>
                                <option value="app">app</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* 3 — Vérifications */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="verification" />
                {openSection === 'verification' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('Google Search Console', 'seo_google_verification', 'Token de vérification Google')}
                        {field('Bing Webmaster', 'seo_bing_verification', 'Token de vérification Bing')}
                        {field('Yandex Webmaster', 'seo_yandex_verification', 'Token Yandex')}
                        {field('Pinterest', 'seo_pinterest_verification', 'Token Pinterest')}
                    </div>
                )}
            </div>

            {/* 4 — Technique */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="technical" />
                {openSection === 'technical' && (
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">Favicon (URL)</label>
                                <div className="flex gap-4 items-center">
                                    {form.seo_favicon_url && (
                                        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                                            <img src={form.seo_favicon_url} className="max-w-full max-h-full object-contain" alt="favicon" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="url"
                                            value={form.seo_favicon_url}
                                            onChange={e => update('seo_favicon_url', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                            placeholder="/favicon.ico"
                                        />
                                        <div className="relative mt-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'seo_favicon_url')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100 hover:border-black transition-colors cursor-pointer">
                                                <ImageIcon className="w-4 h-4 mr-2" />
                                                Uploader un Favicon
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {field('Couleur thème (theme-color)', 'seo_theme_color', '#000000', 'color')}
                            {field('Viewport', 'seo_viewport', 'width=device-width, initial-scale=1')}
                            <div>
                                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">Robots Meta</label>
                                <select
                                    value={form.seo_robots_meta}
                                    onChange={e => update('seo_robots_meta', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                >
                                    <option value="index, follow">index, follow (recommandé)</option>
                                    <option value="noindex, follow">noindex, follow</option>
                                    <option value="index, nofollow">index, nofollow</option>
                                    <option value="noindex, nofollow">noindex, nofollow</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Robots.txt</label>
                                <a href="/robots.txt" target="_blank" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Voir actuel
                                </a>
                            </div>
                            <textarea
                                rows={5}
                                value={form.seo_robots_txt}
                                onChange={e => update('seo_robots_txt', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono bg-gray-50 resize-none"
                            />
                        </div>
                        <a href="/sitemap.xml" target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <Map className="w-4 h-4" /> Voir le Sitemap XML
                        </a>
                    </div>
                )}
            </div>

            {/* 5 — Réseaux sociaux */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="social" />
                {openSection === 'social' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('Page Facebook (URL)', 'seo_facebook_page', 'https://facebook.com/superEcom', 'url')}
                        {field('Instagram (@handle)', 'seo_instagram_handle', '@superEcom.ma')}
                        {field('YouTube (URL chaîne)', 'seo_youtube_channel', 'https://youtube.com/@superEcom', 'url')}
                        {field('TikTok (@handle)', 'seo_tiktok_handle', '@superEcom.ma')}
                    </div>
                )}
            </div>

            {/* 6 — Analytics */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="analytics" />
                {openSection === 'analytics' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('Google Analytics 4 (ID)', 'seo_google_analytics_id', 'G-XXXXXXXXXX', 'text', 'Ex: G-ABC123DEF')}
                        {field('Google Tag Manager (ID)', 'seo_gtm_id', 'GTM-XXXXXXX', 'text', 'Ex: GTM-ABCDEF')}
                        {field('Hotjar (Site ID)', 'seo_hotjar_id', '1234567', 'text')}
                        {field('Microsoft Clarity (ID)', 'seo_clarity_id', 'xxxxxxxxxx', 'text')}
                    </div>
                )}
            </div>

            {/* 7 — Avancé (Schema.org) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHeader s="advanced" />
                {openSection === 'advanced' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">Type Schema.org</label>
                            <select
                                value={form.seo_schema_org_type}
                                onChange={e => update('seo_schema_org_type', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            >
                                <option value="OnlineStore">OnlineStore</option>
                                <option value="BookStore">BookStore</option>
                                <option value="Organization">Organization</option>
                                <option value="LocalBusiness">LocalBusiness</option>
                            </select>
                        </div>
                        {field('Fourchette de prix', 'seo_price_range', '50 MAD - 300 MAD', 'text', 'Affichée dans la rich card Google')}
                        {field('Ville', 'seo_address_city', 'Casablanca')}
                        {field('Pays (code)', 'seo_address_country', 'MA')}
                        {field('Téléphone de contact', 'seo_contact_phone', '+212600000000', 'tel')}
                        {field('Email de contact', 'seo_contact_email', 'contact@superEcom.com', 'email')}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
            >
                <Save className="w-4 h-4" />
                {loading ? 'Enregistrement...' : 'Sauvegarder le SEO'}
            </button>
        </form>
    )
}
