'use client'

import React, { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface Book {
    id: string
    title: string
    price: number
    description: string
    longDescription?: string | null
    category?: string | null
}

interface CaptionPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    book: Book | null
}

export default function CaptionPreviewModal({ isOpen, onClose, book }: CaptionPreviewModalProps) {
    const [caption, setCaption] = useState('')
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!isOpen || !book) return

        setLoading(true)
        setCopied(false)
        setCaption('')

        // Fetch settings for whatsapp number
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                let whatsappPhone = '+212 600 00 00 00'
                if (data.success && data.settings?.contact_phone) {
                    whatsappPhone = data.settings.contact_phone
                }

                const baseDesc = book.description || book.title
                const productUrl = `${window.location.origin}/fr/books/${book.id}`
                const waPhone = whatsappPhone.replace(/[^0-9+]/g, '')
                const waLink = `https://wa.me/${waPhone.startsWith('+') ? waPhone.slice(1) : waPhone}`
                const hashtags = `#riwaya #lecture #booktok #riwaya #livre #maroc #culture ${book.category ? `#${book.category.toLowerCase().replace(/\s+/g, '')}` : ''}`
                
                setCaption(`${baseDesc}\n\n📖 Lien pour commander : ${productUrl}\n💰 Prix : ${book.price} MAD\n🚚 Paiement à la livraison + Livraison rapide !\n\n💬 Commander via WhatsApp : ${waLink}\n\n${hashtags}`)
            })
            .catch(console.error)
            .finally(() => setLoading(false))

    }, [isOpen, book])

    const handleCopy = () => {
        navigator.clipboard.writeText(caption)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen || !book) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Prévisualiser Caption</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="relative">
                            <textarea
                                value={caption}
                                readOnly
                                className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-black/5"
                            />
                            <button
                                onClick={handleCopy}
                                className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                                    copied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-900'
                                }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
