import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Normalise une URL d'image ou une chaîne Base64 (Odoo)
 * @param raw L'image brute de la BDD
 * @returns L'image normalisée ou le placeholder
 */
export function normalizeImage(raw: string | null | undefined): string {
    const img = raw?.trim() || ''
    if (!img) return '/book-placeholder.png'
    
    // Déjà une URL ou déjà formaté
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) {
        // Ignorer si c'est un message d'erreur
        if (img.includes('cellule')) return '/book-placeholder.png'
        
        // Cas particulier : /9j/ détecté comme chemin local alors que c'est du JPEG Base64
        if (img.startsWith('/9j/')) return 'data:image/jpeg;base64,' + img
        return img
    }

    // Détection de chemin local sans slash (ex: uploads/books/...)
    if (img.startsWith('uploads/')) return '/' + img

    // Détection Base64 pure (Odoo)
    if (img.includes(' ')) return '/book-placeholder.png'
    
    if (img.startsWith('iVBOR')) return 'data:image/png;base64,' + img
    if (img.startsWith('/9j/')) return 'data:image/jpeg;base64,' + img
    if (img.length > 50) return 'data:image/jpeg;base64,' + img

    return img
}
