'use client'

import { BookOpen } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function CatalogDownload() {
    const params = useParams()
    const locale = params.locale as string

    const dict = {
        fr: 'Télécharger le Catalogue',
        ar: 'تحميل الكتالوج الكامل',
        en: 'Download Catalog'
    }[locale as 'fr' | 'ar' | 'en'] || 'Télécharger le Catalogue'

    const handleDownload = () => {
        // Déclenche directement le téléchargement (via CatalogModal configuré pour 12/page)
        window.dispatchEvent(new CustomEvent('open-catalog-user'))
    }

    return (
        <button 
            onClick={handleDownload}
            className="group relative flex items-center gap-3 px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-black font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
            <div className="p-2 bg-purple-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="tracking-tight">{dict}</span>
        </button>
    )
}
