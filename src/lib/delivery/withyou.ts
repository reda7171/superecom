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

        // Utilisation de URLSearchParams car beaucoup d'API marocaines préfèrent le format form-data/urlencoded au JSON brut
        const params = new URLSearchParams()
        params.append('key', this.config.key)
        params.append('token', this.config.token)
        
        Object.entries(data).forEach(([k, v]) => {
            if (typeof v === 'object') {
                params.append(k, JSON.stringify(v))
            } else {
                params.append(k, String(v))
            }
        })

        console.log(`[WithYou] Calling ${url}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: params.toString(),
                signal: controller.signal
            })

            const bodyText = await response.text()
            console.log(`[WithYou] Response status: ${response.status}`)
            
            let parsed
            try {
                parsed = JSON.parse(bodyText)
            } catch (e) {
                // Si c'est du HTML, on log les 200 premiers caractères pour voir l'erreur
                if (bodyText.includes('<!DOCTYPE html>')) {
                    console.error(`[WithYou] Received HTML instead of JSON from ${endpoint}. Possible 404 or wrong endpoint.`)
                }
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
        try {
            const res = await this.request('/getville')
            console.log('[WithYou] Raw cities response:', JSON.stringify(res).substring(0, 500))
            
            let cityList: string[] = []

            if (Array.isArray(res)) {
                cityList = res.map((v: any) => v.ville || v)
            } else if (res?.data && Array.isArray(res.data)) {
                cityList = res.data.map((v: any) => v.ville || v)
            }

            // Filtrer les doublons et les valeurs vides
            cityList = Array.from(new Set(cityList.filter(v => v && typeof v === 'string')))

            if (cityList.length > 0) return cityList

            // Fallback si l'API ne renvoie rien
            return [
                "Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir", "Meknes", "Oujda", "Kenitra", "Tetouan",
                "Safi", "Mohammedia", "Khouribga", "El Jadida", "Beni Mellal", "Nador", "Taza", "Settat", "Berrechid",
                "Khemisset", "Inezgane", "Ksar El Kebir", "Larache", "Guelmim", "Berkane", "Khenifra", "Sidi Kacem",
                "Sidi Slimane", "Errachidia", "Taroudant", "Ouarzazate", "Tiznit", "Youssoufia", "Ben Guerir", "Tan-Tan",
                "Ouazzane", "Guercif", "Dakhla", "Laayoune"
            ]
        } catch (error) {
            console.error('[WithYou] Error fetching cities:', error)
            return [
                "Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir", "Meknes", "Oujda", "Kenitra", "Tetouan",
                "Safi", "Mohammedia", "Khouribga", "El Jadida", "Beni Mellal", "Nador", "Taza", "Settat", "Berrechid",
                "Khemisset", "Inezgane", "Ksar El Kebir", "Larache", "Guelmim", "Berkane", "Khenifra", "Sidi Kacem",
                "Sidi Slimane", "Errachidia", "Taroudant", "Ouarzazate", "Tiznit", "Youssoufia", "Ben Guerir", "Tan-Tan",
                "Ouazzane", "Guercif", "Dakhla", "Laayoune"
            ]
        }
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
