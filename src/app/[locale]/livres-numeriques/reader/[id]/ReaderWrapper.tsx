'use client'

import ImmersivePdfReader from '@/components/ImmersivePdfReader'
import { useRouter } from '@/i18n/routing'

export default function ImmersivePdfReaderWrapper({ pdfUrl, title }: { pdfUrl: string, title: string }) {
    const router = useRouter()

    const handleClose = () => {
        router.back()
    }

    return (
        <ImmersivePdfReader 
            pdfUrl={pdfUrl} 
            title={title} 
            onClose={handleClose} 
        />
    )
}
