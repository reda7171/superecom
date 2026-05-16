import { getSetting } from '@/lib/actions/site-settings'

export class JumiaAPI {
    private baseUrl: string
    private email: string
    private apiKey: string
    private accessToken: string | null = null

    constructor(email: string, apiKey: string, environment: string) {
        this.email = email // Now holds Client ID
        this.apiKey = apiKey // Now holds Refresh Token
        this.baseUrl = environment === 'live' 
            ? 'https://vendor-api.jumia.com' 
            : 'https://vendor-api-staging.jumia.com'
    }

    static async getInstance() {
        const enabled = await getSetting('jumia_enabled', 'false')
        if (enabled !== 'true') return null

        const email = await getSetting('jumia_email', '')
        const apiKey = await getSetting('jumia_api_key', '')
        const env = await getSetting('jumia_environment', 'sandbox')

        if (!email || !apiKey) return null

        const instance = new JumiaAPI(email, apiKey, env || 'sandbox')
        await instance.refreshAccessToken()
        return instance
    }

    private async refreshAccessToken() {
        const response = await fetch(`${this.baseUrl}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.email,
                refresh_token: this.apiKey,
                grant_type: 'refresh_token'
            })
        })

        if (!response.ok) {
            console.error('Jumia Auth Error:', await response.text())
            throw new Error('Impossible de générer le jeton Jumia (Refresh Token invalide ou expiré)')
        }

        const data = await response.json()
        this.accessToken = data.access_token
    }

    private async request(endpoint: string, method: string = 'GET', body?: any) {
        // Nouvelle API Jumia Vendor utilise Bearer Token
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: body ? JSON.stringify(body) : undefined
        })

        if (!response.ok) {
            throw new Error(`Erreur API Jumia: ${response.statusText}`)
        }

        return response.json()
    }

    // --- Endpoints Authentication ---

    async login(password: string) {
        return this.request('/login', 'POST', { email: this.email, password })
    }

    async getToken(clientId: string, clientSecret: string) {
        return this.request('/token', 'POST', { 
            client_id: clientId, 
            client_secret: clientSecret, 
            grant_type: 'client_credentials' 
        })
    }

    // --- Endpoints Boutiques (Shops) ---

    async getShops() {
        return this.request('/shops')
    }

    async getShopsOfMasterShop() {
        return this.request('/shops-of-master-shop')
    }

    // --- Endpoints Commandes (Orders) ---

    async getOrders(limit = 100, offset = 0, status?: string) {
        let url = `/orders?limit=${limit}&offset=${offset}`
        if (status) {
            url += `&status=${status}`
        }
        return this.request(url)
    }

    async getOrderItems(orderId: string) {
        return this.request(`/orders/items?order_id=${orderId}`)
    }

    async packOrders(payload: any) {
        return this.request('/orders/pack', 'POST', payload)
    }

    async readyToShipOrders(payload: any) {
        return this.request('/orders/ready-to-ship', 'POST', payload)
    }

    async printLabels(payload: any) {
        return this.request('/orders/print-labels', 'POST', payload)
    }

    async cancelOrders(payload: any) {
        return this.request('/orders/cancel', 'POST', payload)
    }

    async getShipmentProviders() {
        return this.request('/orders/shipment-providers')
    }

    // --- Endpoints Produits (Catalog) ---

    async getProducts(limit = 100, offset = 0) {
        return this.request(`/catalog/products?limit=${limit}&offset=${offset}`)
    }

    async getCategories(limit = 100, offset = 0) {
        return this.request(`/catalog/categories?limit=${limit}&offset=${offset}`)
    }

    async getBrands(limit = 100, offset = 0) {
        return this.request(`/catalog/brands?limit=${limit}&offset=${offset}`)
    }

    async getAttributeSets(id: string) {
        return this.request(`/catalog/attribute-sets/${id}`)
    }

    async getCatalogStock(limit = 100, offset = 0) {
        return this.request(`/catalog/stock?limit=${limit}&offset=${offset}`)
    }

    // --- Endpoints Feeds (Mises à jour asynchrones) ---

    async createProducts(payload: any) {
        return this.request('/feeds/products/create', 'POST', payload)
    }

    async updateProducts(payload: any) {
        return this.request('/feeds/products/update', 'POST', payload)
    }

    async updateStock(payload: any) {
        return this.request('/feeds/products/stock', 'POST', payload)
    }

    async updatePrice(payload: any) {
        return this.request('/feeds/products/price', 'POST', payload)
    }

    async updateStatus(payload: any) {
        return this.request('/feeds/products/status', 'POST', payload)
    }

    async getFeedStatus(feedId: string) {
        return this.request(`/feeds/${feedId}`)
    }

    // --- Endpoints Consignation (Consignment) ---

    async getConsignmentOrders(limit = 100, offset = 0) {
        return this.request(`/consignment-order?limit=${limit}&offset=${offset}`)
    }

    async getConsignmentOrder(purchaseOrderNumber: string) {
        return this.request(`/consignment-order/${purchaseOrderNumber}`)
    }

    async getConsignmentStock(limit = 100, offset = 0) {
        return this.request(`/consignment-stock?limit=${limit}&offset=${offset}`)
    }

    // --- Endpoints Finance ---

    async getPayoutStatement(dateFrom?: string, dateTo?: string) {
        let url = '/payout-statement'
        const params = new URLSearchParams()
        if (dateFrom) params.append('CreatedAfter', dateFrom)
        if (dateTo) params.append('CreatedBefore', dateTo)
        
        if (params.toString()) {
            url += `?${params.toString()}`
        }
        return this.request(url)
    }
}
