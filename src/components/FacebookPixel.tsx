'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
    interface Window {
        fbq: any
    }
}

// Initialisation du pixel
export const initFacebookPixel = (pixelId: string) => {
    if (typeof window === 'undefined') return

    // Éviter double initialisation
    if (window.fbq) return

    // Script Facebook Pixel
    const script = document.createElement('script')
    script.innerHTML = `
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
  `
    document.head.appendChild(script)

    // Noscript fallback
    const noscript = document.createElement('noscript')
    noscript.innerHTML = `<img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`
    document.body.appendChild(noscript)
}

// Événements personnalisés
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

// Composant principal
export default function FacebookPixel() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

    useEffect(() => {
        if (!pixelId) return

        // Ignorer admin
        if (pathname?.includes('/admin')) return

        initFacebookPixel(pixelId)
    }, [pixelId, pathname])

    // Track navigation
    useEffect(() => {
        if (!pixelId || !window.fbq) return
        if (pathname?.includes('/admin')) return

        window.fbq('track', 'PageView')
    }, [pathname, searchParams, pixelId])

    return null
}
