'use server'

import { prisma } from '@/lib/prisma'
import Fuse from 'fuse.js'
import { expandQueryWithSynonyms } from '@/lib/utils/synonyms'
import { parsePriceFilter } from '@/lib/utils/search'

export async function searchBooksPredictive(query: string) {
    if (!query || query.length < 2) return []

    // Parser le prix dans la requête
    const priceFilter = parsePriceFilter(query);
    const expandedQuery = expandQueryWithSynonyms(priceFilter.cleanQuery || '');

    try {
        const where: any = { active: true };

        if (priceFilter.minPrice !== undefined || priceFilter.maxPrice !== undefined) {
            where.price = {};
            if (priceFilter.minPrice !== undefined) where.price.gte = priceFilter.minPrice;
            if (priceFilter.maxPrice !== undefined) where.price.lte = priceFilter.maxPrice;
        }

        const filteredBooks = await prisma.book.findMany({
            where,
            select: {
                id: true,
                title: true,
                author: true,
                image: true,
                price: true,
                category: true
            }
        })

        // Si on a filtré par prix mais qu'il n'y a pas de texte de recherche restant
        if (!priceFilter.cleanQuery) {
            return filteredBooks.slice(0, 6);
        }

        const fuseOptions = {
            keys: [
                { name: 'title', weight: 1.0 },
                { name: 'author', weight: 0.8 },
                { name: 'category', weight: 0.5 }
            ],
            threshold: 0.4,
            distance: 100,
            ignoreLocation: true
        }

        const fuse = new Fuse(filteredBooks, fuseOptions)
        const results = fuse.search(expandedQuery)
        const topResults = results.slice(0, 6).map(result => result.item)

        // Log de la recherche pour les tendances
        if (topResults.length > 0) {
            const bestCat = topResults[0].category;
            (prisma as any).searchLog.create({
                data: {
                    query: query.toLowerCase(),
                    category: bestCat
                }
            }).catch(() => { })
        }

        return topResults
    } catch (error) {
        console.error('Erreur recherche fuzzy:', error)
        return []
    }
}
