'use client'

import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ShareArticle({ title }: { title: string }) {
    const [url, setUrl] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setUrl(window.location.href)
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!url) return null

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">Partager :</span>
            
            {/* Facebook */}
            <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all text-gray-500 shadow-sm"
                aria-label="Partager sur Facebook"
            >
                <Facebook className="w-4 h-4" />
            </a>

            {/* X (Twitter) */}
            <a 
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-500 shadow-sm"
                aria-label="Partager sur X"
            >
                <Twitter className="w-4 h-4" />
            </a>

            {/* LinkedIn */}
            <a 
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all text-gray-500 shadow-sm"
                aria-label="Partager sur LinkedIn"
            >
                <Linkedin className="w-4 h-4" />
            </a>

            {/* WhatsApp */}
            <a 
                href={`https://wa.me/?text=${encodedTitle} - ${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all text-gray-500 shadow-sm"
                aria-label="Partager sur WhatsApp"
            >
                <MessageCircle className="w-4 h-4" />
            </a>

            {/* Copy Link */}
            <button 
                onClick={handleCopy}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-200 transition-all text-gray-500 relative shadow-sm"
                aria-label="Copier le lien"
            >
                <Link2 className="w-4 h-4" />
                {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                        Lien copié !
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                    </span>
                )}
            </button>
        </div>
    )
}
