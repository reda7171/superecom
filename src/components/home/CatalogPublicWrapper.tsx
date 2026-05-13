'use client'

import CatalogModal from '@/components/admin/CatalogModal'

export default function CatalogPublicWrapper() {
    return (
        <CatalogModal 
            isOpen={false} 
            onClose={() => {}} 
            triggerEvent="open-catalog-user"
        />
    )
}
