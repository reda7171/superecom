'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
    const phoneNumber = '212600000000' // Replace with actual number
    const message = encodeURIComponent('Bonjour, je suis intéressé par vos livres.')
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl group"
            aria-label="Contact us on WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-white text-white" />
            <span className="absolute right-full mr-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Discutez avec nous
            </span>
        </a>
    )
}
