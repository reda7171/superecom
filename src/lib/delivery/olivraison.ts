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

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey
            })
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(`Erreur Auth Olivraison: ${err.description || response.statusText}`)
        }

        const data: AuthResponse = await response.json()
        this.token = data.token
        return data.token
    }

    /**
     * Exécuter une requête autorisée
     */
    private async request(endpoint: string, options: RequestInit = {}) {
        if (!this.token) {
            await this.login()
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        }

        let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

        // Si 401, le token est peut-être expiré, on réessaie une fois après login
        if (response.status === 401) {
            await this.login()
            response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    'Authorization': `Bearer ${this.token}`
                }
            })
        }

        if (!response.ok) {
            const err = await response.json()
            throw new Error(`Erreur API Olivraison [${endpoint}]: ${err.description || response.statusText}`)
        }

        return response.json()
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
        return this.request('/pickup', {
            method: 'POST',
            body: JSON.stringify({ packages: trackingIDs })
        })
    }
}

export const olivraison = new OlivraisonService()
