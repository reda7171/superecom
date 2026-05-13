/**
 * Service d'intégration pour Olivraison API
 * Basé sur la documentation olivraison.md
 */

const BASE_URL = 'https://partners.olivraison.com'

interface OlivraisonConfig {
    apiKey: string
    secretKey: string
}

interface AuthResponse {
    token: string
    expiration: string
}

interface PackageData {
    price: number
    comment?: string
    description?: string
    inventory?: boolean
    name: string
    destination: {
        name: string
        phone: string
        city: string
        streetAddress: string
    }
}

class OlivraisonService {
    private config: OlivraisonConfig
    private token: string | null = null

    constructor() {
        this.config = {
            apiKey: process.env.OLIVRAISON_API_KEY || '',
            secretKey: process.env.OLIVRAISON_SECRET_KEY || ''
        }
    }

    /**
     * Authentification
     */
    private async login(): Promise<string> {
        if (!this.config.apiKey || !this.config.secretKey) {
            throw new Error('OLIVRAISON_API_KEY ou OLIVRAISON_SECRET_KEY manquante dans .env')
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: this.config.apiKey,
                    secretKey: this.config.secretKey
                }),
                signal: controller.signal
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(`Erreur Auth Olivraison: ${err.description || response.statusText}`)
            }

            const data: AuthResponse = await response.json()
            this.token = data.token
            return data.token
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Timeout lors de l\'authentification Olivraison (10s)')
            }
            throw error
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Exécuter une requête autorisée
     */
    private async request(endpoint: string, options: RequestInit = {}) {
        if (!this.token) {
            await this.login()
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Riwaya-Backend/1.0',
            ...((options.headers as Record<string, string>) || {})
        }

        const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for standard requests

        try {
            let response = await fetch(url, { ...options, headers, signal: controller.signal })

            // Si 401, le token est peut-être expiré, on réessaie une fois après login
            if (response.status === 401) {
                await this.login()
                headers['Authorization'] = `Bearer ${this.token}`
                response = await fetch(url, { ...options, headers, signal: controller.signal })
            }

            const contentType = response.headers.get('content-type')
            const bodyText = await response.text()

            if (!response.ok) {
                console.error(`[Olivraison] ❌ API Error (${response.status}):`, bodyText)
                let parsedErr
                try {
                    parsedErr = JSON.parse(bodyText)
                } catch (e) {
                    parsedErr = { description: bodyText }
                }
                throw new Error(`Erreur API Olivraison [${endpoint}]: ${parsedErr.description || parsedErr.message || response.statusText}`)
            }

            if (contentType && contentType.includes('application/json')) {
                try {
                    return JSON.parse(bodyText)
                } catch (e) {
                    return bodyText
                }
            }

            return bodyText
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error(`Timeout lors de la requête Olivraison ${endpoint} (15s)`)
            }
            throw error
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Liste des villes
     */
    async getCities(): Promise<string[]> {
        return this.request('/cities')
    }

    /**
     * Créer un colis (Statut CONFIRMED)
     */
    async createPackage(data: PackageData) {
        return this.request('/package', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    /**
     * Détails d'un colis
     */
    async getPackageDetails(trackingID: string) {
        return this.request(`/package/${trackingID}`)
    }

    /**
     * Générer le sticker / BL (Sticker/SIP)
     */
    async getSticker(trackingIDs: string[]) {
        const res = await this.request('/pickup', {
            method: 'POST',
            body: JSON.stringify({ packages: trackingIDs })
        })


        // S'assurer que les liens sont des URLs complètes
        const items = Array.isArray(res) ? res : (res?.data || res?.results || [])
        return items.map((item: any) => ({
            ...item,
            stickerFilePath: item.stickerFilePath?.startsWith('http') ? item.stickerFilePath : `${BASE_URL}${item.stickerFilePath}`,
            sipFilePath: item.sipFilePath?.startsWith('http') ? item.sipFilePath : `${BASE_URL}${item.sipFilePath}`
        }))
    }

    /**
     * Vérifier si un numéro de téléphone est sur liste noire
     */
    async checkBlacklist(phoneNumber: string): Promise<{ phone: string; name: string; count: number; blacklisted: boolean }> {
        return this.request(`/package/blacklisted-destinations/${phoneNumber}`)
    }

    /**
     * Vérifier une liste de numéros en masse
     */
    async checkBlacklistBulk(phones: string[]): Promise<{ results: Array<{ phone: string; name: string; count: number; blacklisted: boolean }> }> {
        return this.request('/package/blacklisted-destinations/bulk', {
            method: 'POST',
            body: JSON.stringify({ phones })
        })
    }
}

export const olivraison = new OlivraisonService()
