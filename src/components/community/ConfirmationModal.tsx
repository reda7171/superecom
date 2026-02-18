'use client'

import { useTranslations } from 'next-intl'
import { X, AlertCircle } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'info'
}: ConfirmationModalProps) {
    const tcmn = useTranslations('Common')

    if (!isOpen) return null

    const colors = {
        danger: 'bg-red-50 text-red-600 border-red-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        info: 'bg-pixio-cream text-black border-pixio-cream'
    }

    const btnColors = {
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-100',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
        info: 'bg-black hover:bg-gray-800 shadow-black/10'
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[variant]}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mb-8">
                        <h2 className="text-xl font-black text-black leading-tight">{title}</h2>
                        <p className="text-sm text-gray-400 font-bold leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className={`w-full text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${btnColors[variant]}`}
                        >
                            {confirmText || 'Confirmer'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
                        >
                            {cancelText || 'Annuler'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
