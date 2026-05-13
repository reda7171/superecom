'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import CatalogModal from './CatalogModal'

export default function CatalogButton() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                title="Générer un catalogue PDF"
            >
                <FileDown className="w-5 h-5 mr-2" />
                Catalogue PDF
            </button>

            <CatalogModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    )
}
