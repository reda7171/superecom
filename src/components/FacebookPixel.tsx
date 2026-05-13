'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

declare global {
    interface Window {
        fbq: any
        _fbq: any
    }
}

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, data)
    }
}

export const trackCustomEvent = (eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, data)
    }
}

export default function FacebookPixel({ pixelId: propPixelId }: { pixelId?: string | null }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const pixelId = propPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

    useEffect(() => {
        if (!pixelId || !window.fbq) return
        if (pathname?.includes('/admin')) return

        window.fbq('track', 'PageView')
    }, [pathname, searchParams, pixelId])

    if (!pixelId || pathname?.includes('/admin')) {
        return null
    }

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
                }}
            />
            <noscript suppressHydrationWarning>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                />
            </noscript>
        </>
    )
}
