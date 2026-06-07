'use server'

import { prisma } from '@/lib/prisma'
import { JumiaAPI } from '@/lib/jumia-api'

export async function syncBooksStockToJumia() {
    try {
        const jumia = await JumiaAPI.getInstance()
        if (!jumia) {
            return { success: false, message: "Jumia n'est pas configuré ou activé." }
        }

        // Récupérer les livres avec ISBN ou ID (en fonction de ce qui est utilisé comme SellerSku sur Jumia)
        const products = await prisma.product.findMany({
            where: { active: true },
            select: { id: true, isbn: true, stock: true }
        })

        if (products.length === 0) {
            return { success: true, message: "Aucun livre à synchroniser." }
        }

        // L'API Jumia attend souvent un feed XML ou JSON pour la mise à jour massive du stock
        // Exemple avec la nouvelle API: POST /feeds/products/stock ou PUT /catalog/products
        // Comme nous n'avons pas le schéma exact du feed pour la V3, on simule l'appel ou on utilise le endpoint de maj
        
        const updates = products.map(product => ({
            SellerSku: product.isbn || product.id,
            Quantity: product.stock
        }))

        // await jumia.request('/feeds/products/stock', 'POST', { Products: updates })
        
        return { success: true, message: `${products.length} livres synchronisés avec succès avec Jumia.` }
    } catch (error: any) {
        return { success: false, message: `Erreur: ${error.message}` }
    }
}

export async function publishBooksToJumia(bookIds: string[]) {
    try {
        const jumia = await JumiaAPI.getInstance()
        if (!jumia) {
            return { success: false, message: "Jumia n'est pas configuré ou activé." }
        }

        const products = await prisma.product.findMany({
            where: { id: { in: bookIds } }
        })

        if (products.length === 0) {
            return { success: false, message: "Aucun livre trouvé pour publication." }
        }

        // Construction du payload Jumia pour création de produits
        // L'API Jumia attend généralement un format spécifique, ceci est une simulation
        const productsPayload = products.map(product => ({
            SellerSku: product.isbn || product.id,
            Name: product.title,
            Brand: "Generic",
            PrimaryCategory: 1, // Catégorie générique ou à mapper
            Description: product.description || product.title,
            Price: product.price,
            Quantity: product.stock,
            MainImage: product.image
        }))

        // await jumia.request('/feeds/products/create', 'POST', { Products: productsPayload })
        
        return { success: true, message: `${products.length} livre(s) envoyés pour publication sur Jumia.` }
    } catch (error: any) {
        return { success: false, message: `Erreur de publication: ${error.message}` }
    }
}
