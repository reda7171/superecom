'use client'

import { useEffect, useState } from 'react'

/**
 * Hook pour détecter si on est sur desktop (≥1024px)
 * Évite les erreurs d'hydratation en utilisant useEffect
 */
export function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        // Fonction pour vérifier la taille d'écran
        const checkIsDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }

        // Check initial
        checkIsDesktop()

        // Écouter les changements de taille
        window.addEventListener('resize', checkIsDesktop)

        return () => window.removeEventListener('resize', checkIsDesktop)
    }, [])

    return isDesktop
}

/**
 * Hook pour désactiver les animations sur desktop
 * Retourne une classe CSS conditionnelle
 */
export function useResponsiveAnimation(animationClass: string) {
    const isDesktop = useIsDesktop()

    // Sur desktop, retourner une classe vide
    // Sur mobile/tablet, retourner l'animation
    return isDesktop ? '' : animationClass
}
