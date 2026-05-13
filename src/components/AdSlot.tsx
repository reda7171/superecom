import { getActiveAds } from '@/lib/actions/advertisements'
import { AdPlacement } from '@prisma/client'
import InternalAdBanner from './InternalAdBanner'

interface AdSlotProps {
    placement: AdPlacement
    className?: string
    closeable?: boolean
}

export default async function AdSlot({ placement, className = '', closeable = false }: AdSlotProps) {
    const ads = await getActiveAds(placement)

    if (ads.length === 0) return null

    // Prendre la première pub (priorité la plus élevée)
    const ad = ads[0]

    return (
        <div className={`ad-slot ${className}`}>
            <InternalAdBanner ad={ad} closeable={closeable} />
        </div>
    )
}
