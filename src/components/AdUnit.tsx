'use client'

import { useEffect } from 'react'

interface AdUnitProps {
    publisherId: string
    slot: string
    format?: 'auto' | 'fluid' | 'rectangle'
    responsive?: boolean
    isEnabled: boolean
    className?: string
}

export default function AdUnit({ 
    publisherId, 
    slot, 
    format = 'auto', 
    responsive = true, 
    isEnabled,
    className = ""
}: AdUnitProps) {
    useEffect(() => {
        if (isEnabled && publisherId) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error('AdSense error:', err);
            }
        }
    }, [isEnabled, publisherId]);

    if (!isEnabled || !publisherId) return null;

    const fullId = publisherId.startsWith('ca-pub-') ? publisherId : `ca-pub-${publisherId}`

    return (
        <div className={`adsense-container my-10 overflow-hidden flex justify-center ${className}`}>
            <ins 
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={fullId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
}
