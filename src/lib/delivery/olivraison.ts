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
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Riwaya-Backend/1.0'
        }

        const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

        console.log(`[Olivraison] 🚀 Request: ${options.method || 'GET'} ${url}`)
        if (options.body) {
            console.log(`[Olivraison] 📦 Body:`, options.body)
        }

        let response = await fetch(url, { ...options, headers })

        // Si 401, le token est peut-être expiré, on réessaie une fois après login
        if (response.status === 401) {
            console.log('[Olivraison] 🔄 Token expired, retrying login...')
            await this.login()
            headers['Authorization'] = `Bearer ${this.token}`
            response = await fetch(url, { ...options, headers })
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
                console.warn('[Olivraison] ⚠️ Failed to parse JSON even with application/json header')
                return bodyText
            }
        }

        return bodyText
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
        console.log('📄 Olivraison getSticker response:', JSON.stringify(res, null, 2))

        // S'assurer que les liens sont des URLs complètes
        const items = Array.isArray(res) ? res : (res?.data || res?.results || [])
        return items.map((item: any) => ({
            ...item,
            stickerFilePath: item.stickerFilePath?.startsWith('http') ? item.stickerFilePath : `${BASE_URL}${item.stickerFilePath}`,
            sipFilePath: item.sipFilePath?.startsWith('http') ? item.sipFilePath : `${BASE_URL}${item.sipFilePath}`
        }))
    }
}

export const olivraison = new OlivraisonService()
