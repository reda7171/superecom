'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, ChevronLeft, Truck, ShieldCheck, Phone, MapPin, User, MessageSquare, Usb } from 'lucide-react'
import { createUsbOrder } from '@/lib/actions/usb-orders'
import { COMBO_PRICES } from '@/lib/usb-config'

/* ================================================================
   CONFIG LANGUES
================================================================ */
const LANGUAGES = [
    {
        code: 'AR',
        name: 'عربي',
        label: 'Arabe',
        flag: '🇲🇦',
        color: '#4ECDC4',
        bg: '#F0FAFA',
        border: '#4ECDC4',
        series: ['Alef Ba Ta – Alphabet animé', 'Mon Petit Coran', 'Les Bonnes Valeurs Islamiques', 'Nasheeds & Chansons'],
    },
    {
        code: 'FR',
        name: 'Français',
        label: 'Français',
        flag: '🇫🇷',
        color: '#FF6B6B',
        bg: '#FFF5F5',
        border: '#FF6B6B',
        series: ['A, B, C – Alphabet Français', 'Compte avec moi 1→100', 'La Nature et les Animaux', 'Je cuisine avec maman'],
    },
    {
        code: 'EN',
        name: 'English',
        label: 'Anglais',
        flag: '🇬🇧',
        color: '#A29BFE',
        bg: '#F8F7FF',
        border: '#A29BFE',
        series: ['ABC for Kids', 'Numbers & Colors', 'Science for Little Ones', 'English Stories'],
    },
] as const

type LangCode = 'AR' | 'FR' | 'EN'

const MOROCCAN_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda',
    'Kénitra', 'Tétouan', 'Salé', 'Mohammadia', 'Khouribga', 'Béni Mellal', 'El Jadida',
    'Taza', 'Nador', 'Settat', 'Larache', 'Khémisset', 'Autre'
]

/* ================================================================
   PAGE DE COMMANDE CLÉ USB
================================================================ */
export default function UsbOrderPage() {
    const [selectedLangs, setSelectedLangs] = useState<LangCode[]>([])
    const [step, setStep] = useState<'select' | 'form' | 'success'>('select')
    const [loading, setLoading] = useState(false)
    const [orderId, setOrderId] = useState('')
    const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', comment: '' })
    const [error, setError] = useState('')

    const nbLangs = selectedLangs.length
    const price = nbLangs > 0 ? COMBO_PRICES[nbLangs] : 0
    const total = price + 30 // frais livraison

    // Savings calculé vs achat séparé
    const savings = nbLangs > 1 ? nbLangs * 199 - price : 0

    const toggleLang = (code: LangCode) => {
        setSelectedLangs(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        )
    }

    const handleSubmit = async () => {
        if (!form.fullName || !form.phone || !form.address || !form.city) {
            setError('Veuillez remplir tous les champs obligatoires.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const result = await createUsbOrder({ ...form, languages: selectedLangs })
            if (result.success) {
                setOrderId(result.orderId!)
                setStep('success')
            } else {
                setError(result.error || 'Une erreur est survenue.')
            }
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    const styles = `
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes checkPop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .slide-up { animation: slideUp 0.4s ease forwards; }
        .check-pop { animation: checkPop 0.3s ease forwards; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .price-shimmer { background: linear-gradient(90deg, #FF6B6B, #FF8E53, #FF6B6B); background-size: 200% auto; animation: shimmer 3s linear infinite; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    `

    /* ============ ÉTAPE SUCCÈS ============ */
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
                <style>{styles}</style>
                <div className="max-w-lg w-full bg-white rounded-3xl p-10 text-center shadow-2xl slide-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 check-pop">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-3">Commande confirmée !</h1>
                    <p className="text-gray-500 mb-4">Votre clé USB éducative est réservée. Notre équipe vous contactera pour confirmer la livraison.</p>
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                        <p className="text-xs text-gray-400 mb-1">Référence commande</p>
                        <p className="text-sm font-bold text-gray-900 font-mono">{orderId}</p>
                        <div className="border-t border-gray-100 mt-3 pt-3">
                            <p className="text-xs text-gray-400 mb-1">Langues choisies</p>
                            <p className="text-sm font-bold text-gray-800">{selectedLangs.join(' + ')}</p>
                        </div>
                        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                            <span className="text-sm text-gray-500">Total payé à la livraison</span>
                            <span className="text-lg font-black text-gray-900">{total} DH</span>
                        </div>
                    </div>
                    <Link href="/fr/cle-usb" className="block w-full py-4 rounded-2xl text-center font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-400 transition-all">
                        Retour à la page Clé USB
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <style>{styles}</style>

            {/* Header page */}
            <div className="bg-white border-b border-gray-100 py-4 px-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link
                        href="/cle-usb"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold px-3 py-2 rounded-xl hover:bg-gray-100"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Retour
                    </Link>
                    <div className="w-px h-6 bg-gray-200" />
                    <Usb className="w-5 h-5 text-gray-500" />
                    <div>
                        <h1 className="text-lg font-black text-gray-900">Commande — Clé USB Éducative</h1>
                        <p className="text-gray-400 text-xs">Paiement à la livraison · Livraison partout au Maroc</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ============ COLONNE GAUCHE ============ */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ÉTAPE 1 : Choisir les langues */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-black">1</div>
                            <h2 className="text-xl font-black text-gray-900">Choisissez vos langues</h2>
                        </div>

                        <div className="space-y-4">
                            {LANGUAGES.map((lang) => {
                                const isSelected = selectedLangs.includes(lang.code)
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => toggleLang(lang.code)}
                                        className="w-full text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden"
                                        style={{
                                            borderColor: isSelected ? lang.color : '#E5E7EB',
                                            backgroundColor: isSelected ? lang.bg : 'white',
                                            boxShadow: isSelected ? `0 0 0 1px ${lang.color}44` : 'none',
                                            transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                                        }}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {/* Checkbox */}
                                                    <div
                                                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200"
                                                        style={{
                                                            borderColor: isSelected ? lang.color : '#D1D5DB',
                                                            backgroundColor: isSelected ? lang.color : 'white',
                                                        }}
                                                    >
                                                        {isSelected && <Check className="w-4 h-4 text-white check-pop" strokeWidth={3} />}
                                                    </div>
                                                    <span className="text-2xl">{lang.flag}</span>
                                                    <div>
                                                        <p className="font-black text-gray-900">{lang.label}</p>
                                                        <p className="text-xs text-gray-400">{lang.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">199 DH</p>
                                                    <p className="text-xs text-gray-400">unité</p>
                                                </div>
                                            </div>

                                            {/* Contenu inclus */}
                                            {isSelected && (
                                                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-1 slide-up" style={{ borderColor: lang.color + '40' }}>
                                                    {lang.series.map((s) => (
                                                        <p key={s} className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span style={{ color: lang.color }}>▸</span> {s}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* ÉTAPE 2 : Formulaire client */}
                    {step === 'form' && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 slide-up">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-black">2</div>
                                <h2 className="text-xl font-black text-gray-900">Vos coordonnées</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Nom */}
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Nom complet *"
                                        value={form.fullName}
                                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-gray-900 outline-none transition-colors text-sm"
                                    />
                                </div>
                                {/* Téléphone */}
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder="Numéro de téléphone *"
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-gray-900 outline-none transition-colors text-sm"
                                    />
                                </div>
                                {/* Adresse */}
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <textarea
                                        placeholder="Adresse complète *"
                                        value={form.address}
                                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-gray-900 outline-none transition-colors text-sm resize-none h-20"
                                    />
                                </div>
                                {/* Ville */}
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        value={form.city}
                                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-gray-900 outline-none transition-colors text-sm appearance-none bg-white"
                                    >
                                        <option value="">Sélectionnez votre ville *</option>
                                        {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {/* Commentaire */}
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <textarea
                                        placeholder="Note optionnelle (ex: disponible le matin)"
                                        value={form.comment}
                                        onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-gray-900 outline-none transition-colors text-sm resize-none h-20"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl text-white font-black text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#FF6B6B' }}
                                >
                                    {loading ? 'Confirmation...' : `Confirmer ma commande — ${total} DH`}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <ShieldCheck className="w-4 h-4" />
                                    Paiement à la livraison. Aucune carte bancaire requise.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ============ RÉSUMÉ DROITE ============ */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-black text-gray-900 mb-5">Résumé de commande</h3>

                        {/* Langues sélectionnées */}
                        {selectedLangs.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Usb className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-sm">Sélectionnez au moins une langue</p>
                            </div>
                        ) : (
                            <div className="space-y-2 mb-4">
                                {selectedLangs.map(code => {
                                    const lang = LANGUAGES.find(l => l.code === code)!
                                    return (
                                        <div key={code} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span>{lang.flag}</span>
                                                <span className="text-gray-700">Contenu {lang.label}</span>
                                            </span>
                                            <span className="font-bold text-gray-900">inclus</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Pricing dynamique */}
                        {nbLangs > 0 && (
                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                {/* Pack badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {nbLangs === 1 && 'Pack 1 langue'}
                                        {nbLangs === 2 && 'Pack 2 langues'}
                                        {nbLangs === 3 && 'Pack Complet 3 langues'}
                                    </span>
                                    <span className="text-gray-900 font-bold">{price} DH</span>
                                </div>

                                {/* Économies */}
                                {savings > 0 && (
                                    <div className="flex items-center justify-between text-green-600">
                                        <span className="text-sm font-medium">Économie combo</span>
                                        <span className="font-bold">-{savings} DH</span>
                                    </div>
                                )}

                                {/* Livraison */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-gray-500">
                                        <Truck className="w-4 h-4" /> Livraison
                                    </span>
                                    <span className="text-gray-900 font-bold">30 DH</span>
                                </div>

                                <div className="border-t border-gray-100 pt-3 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-gray-900">Total COD</span>
                                        <span className="text-2xl font-black price-shimmer">{total} DH</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Payable à la livraison</p>
                                </div>

                                {/* Comparaison prix */}
                                {nbLangs > 1 && (
                                    <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 font-medium">
                                        Vous économisez <strong>{savings} DH</strong> vs l'achat séparé ({nbLangs * 199} DH)
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CTA */}
                        {nbLangs > 0 && step === 'select' && (
                            <button
                                onClick={() => setStep('form')}
                                className="mt-5 w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2 hover:scale-105 transition-all"
                                style={{ backgroundColor: '#FF6B6B' }}
                            >
                                Continuer <ChevronRight className="w-5 h-5" />
                            </button>
                        )}

                        {/* Reassurances */}
                        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <ShieldCheck className="w-4 h-4 text-green-500" /> Satisfait ou remboursé 7 jours
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Truck className="w-4 h-4 text-blue-500" /> Livraison 2-4 jours ouvrables
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Phone className="w-4 h-4 text-orange-500" /> Support client disponible
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
