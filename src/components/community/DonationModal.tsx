'use client'

import { X, Heart, ExternalLink } from 'lucide-react'
import { fbPixelEvents } from '@/lib/facebook-pixel'

interface DonationModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
    if (!isOpen) return null

    const paypalLink = "https://www.paypal.com/donate?hosted_button_id=YOUR_PAYPAL_ID" // À remplacer par le lien réel si disponible

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-pink-50 text-pink-500 border-pink-100">
                            <Heart className="w-6 h-6 fill-current" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mb-8 text-center">
                        <h2 className="text-xl font-black text-black leading-tight">Supporter SuperEcom</h2>
                        <div className="bg-pixio-cream p-4 rounded-2xl border border-pixio-cream/50 mt-4">
                            <p className="text-sm text-black font-black leading-relaxed">
                                Merci ! Si vous appréciez le service, vous pouvez nous soutenir via PayPal.
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                                Minimum conseillé : 5 DHS
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <a
                            href={paypalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => fbPixelEvents.donate(5)}
                            className="w-full bg-[#0070ba] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 hover:bg-[#003087]"
                        >
                            <span>Donner via PayPal</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
                        >
                            Plus tard
                        </button>
                    </div>

                    <p className="text-[8px] text-center text-gray-300 font-bold uppercase tracking-widest mt-6">
                        Chaque geste compte pour maintenir la plateforme gratuite.
                    </p>
                </div>
            </div>
        </div>
    )
}
