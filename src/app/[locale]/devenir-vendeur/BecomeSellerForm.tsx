'use client'

import { useState } from 'react'
import { Send, CheckCircle2, X } from 'lucide-react'
import { createSellerRequest } from '@/lib/actions/seller-requests'

export default function BecomeSellerForm() {
    const [showAlert, setShowAlert] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorMsg('')
        const form = e.currentTarget
        const formData = new FormData(form)
        
        const data = {
            storeName: formData.get('storeName') as string,
            managerName: formData.get('managerName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            city: formData.get('city') as string,
            stockSize: formData.get('stockSize') as string,
        }

        const res = await createSellerRequest(data)

        setIsSubmitting(false)
        if (res.success) {
            setShowAlert(true)
            form.reset()
            setTimeout(() => {
                setShowAlert(false)
            }, 5000)
        } else {
            setErrorMsg(res.error || 'Une erreur est survenue.')
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la boutique / Librairie *</label>
                        <input
                            type="text"
                            name="storeName"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium placeholder-gray-400"
                            placeholder="Ex: Librairie des Oliviers"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom du gérant *</label>
                        <input
                            type="text"
                            name="managerName"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium placeholder-gray-400"
                            placeholder="Votre prénom et nom"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Adresse Email *</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium placeholder-gray-400"
                            placeholder="contact@boutique.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone *</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium placeholder-gray-400"
                            placeholder="+212 6..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ville *</label>
                        <input
                            type="text"
                            name="city"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium placeholder-gray-400"
                            placeholder="Casablanca"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Taille du stock estimée *</label>
                        <select
                            name="stockSize"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-black focus:bg-white transition-all font-medium text-gray-700 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iIzQ3NTU2OSI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAgMjhMMTAgMTJsLTYgNmwtNi02eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] bg-[length:20px_20px] bg-[position:right_1rem_center]"
                        >
                            <option value="">Sélectionnez...</option>
                            <option value="1-50">1 - 50 livres</option>
                            <option value="50-200">50 - 200 livres</option>
                            <option value="200-1000">200 - 1000 livres</option>
                            <option value="1000+">1000+ livres</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    {errorMsg && <p className="text-red-500 font-bold mb-4">{errorMsg}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full px-8 py-5 bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-gray-800 hover:shadow-black/20 hover:-translate-y-1'}`}
                    >
                        <span>{isSubmitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}</span>
                        {!isSubmitting && <Send className="w-5 h-5" />}
                    </button>
                    <p className="text-center text-xs text-gray-400 font-bold mt-4">
                        En soumettant ce formulaire, vous acceptez d&apos;être recontacté par l&apos;équipe Riwaya.
                    </p>
                </div>
            </form>

            {/* Custom Alert Overlay */}
            {showAlert && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 left-0 top-0">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowAlert(false)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-black transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-center mb-3">Merci !</h3>
                        <p className="text-gray-500 font-medium text-center leading-relaxed">
                            Votre candidature a bien été reçue. Notre équipe vous contactera très prochainement pour finaliser la création de votre boutique.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
