// Constantes partagées pour la clé USB (client + serveur)

export const USB_PACKS = {
    AR: { label: 'Arabe', price: 199 },
    FR: { label: 'Français', price: 199 },
    EN: { label: 'Anglais', price: 199 },
} as const

// Prix combo selon nombre de langues
export const COMBO_PRICES: Record<number, number> = {
    1: 199,
    2: 349,
    3: 449,
}

export type LangCode = 'AR' | 'FR' | 'EN'
