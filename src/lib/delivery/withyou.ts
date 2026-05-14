/**
 * Service d'intégration pour WITHYOU API
 * Basé sur la documentation documentation_withyou_livraison
 */

const BASE_URL = 'https://new.withyou.ma/api-rest'

interface WithYouConfig {
    key: string
    token: string
}

interface WithYouPackageData {
    villedest: string
    nomdest: string
    teldest: string
    adressedest: string
    prixcolis: string
    refcolis: string
    observation: string
}

class WithYouService {
    private config: WithYouConfig

    constructor() {
        this.config = {
            key: process.env.WITHYOU_API_KEY || '3c8c2c6fc979f962ca746c63a740afb3',
            token: process.env.WITHYOU_API_TOKEN || 'b245c32a148ccf8c5a4c6d04b78c12080d819f17c379d7553ead04665dc3b6f0'
        }
    }

    private async request(endpoint: string, data: any = {}) {
        const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

        const body = {
            key: this.config.key,
            token: this.config.token,
            ...data
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal
            })

            const bodyText = await response.text()
            let parsed
            try {
                parsed = JSON.parse(bodyText)
            } catch (e) {
                return bodyText
            }

            if (!response.ok) {
                console.error(`[WithYou] ❌ API Error (${response.status}):`, bodyText)
                throw new Error(`Erreur API WithYou [${endpoint}]: ${parsed?.message || response.statusText}`)
            }

            return parsed
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error(`Timeout lors de la requête WithYou ${endpoint} (15s)`)
            }
            throw error
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Liste des villes
     */
    async getCities() {
        const res = await this.request('/getville')
        if (res?.data) {
             return res.data.map((v: any) => v.ville)
        }
        return []
    }

    /**
     * Créer un ou plusieurs colis
     */
    async createPackage(data: WithYouPackageData | WithYouPackageData[]) {
        const payload = Array.isArray(data) ? data : [data]
        return this.request('/savecolis', { data: payload })
    }

    /**
     * Modifier statut
     */
    async updateStatus(codetracking: string, status: string) {
        return this.request('/updatstatus', { codetracking, status })
    }

    /**
     * Obtenir tous les statuts possibles
     */
    async getAllStatus() {
        return this.request('/getallstatus')
    }

    /**
     * Obtenir le statut des colis
     */
    async getStatus(trackingIDs: string[]) {
        return this.request('/getstatus', { data: trackingIDs })
    }
}

export const withyouService = new WithYouService()
