'use server'

import { prisma } from '@/lib/prisma'

export async function getPopularCategories() {
    try {
        const now = new Date();
        const month = now.getMonth(); // 0 = Janvier, 1 = Février, ...

        const seasonalThemes: string[] = [];

        // Logique de saisonnalité
        // Janvier - Février (Rentrée/Organisation)
        if (month === 0 || month === 1) seasonalThemes.push('Organisation');

        // Mars/Avril (Souvent Ramadan - à ajuster selon le calendrier lunaire ou fixer des dates clés)
        // Pour la démo, on simule une période proche du Ramadan ou thèmes spirituels
        if (month === 2 || month === 3) seasonalThemes.push('Ramadan');

        // Septembre (Rentrée scolaire)
        if (month === 8) seasonalThemes.push('Rentrée Scolaire');

        // Décembre (Cadeaux/Fin d'année)
        if (month === 11) seasonalThemes.push('Cadeaux');

        const categories = await prisma.product.groupBy({
            by: ['category'],
            where: {
                active: true,
                category: { not: null }
            },
            _count: {
                category: true
            },
            orderBy: {
                _count: {
                    category: 'desc'
                }
            },
            take: 10
        })

        // On récupère les tendances récentes (dernières 24h)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const trendingLogs = await (prisma as any).searchLog.groupBy({
            by: ['category'],
            where: {
                createdAt: { gte: last24h },
                category: { not: null }
            },
            _count: {
                category: true
            },
            orderBy: {
                _count: {
                    category: 'desc'
                }
            },
            take: 3
        });

        const trendingCats = new Set(trendingLogs.map((l: any) => l.category));

        // On récupère les configs personnalisées (badges, pins)
        const configs = await (prisma as any).categoryConfig.findMany();
        const configMap = new Map<string, any>(configs.map((c: any) => [c.name, c]));

        // On crée une map pour un accès rapide aux comptes
        const countMap = new Map<string, number>(categories.map(c => [c.category as string, c._count.category]));

        const dbCategories = categories.map(c => c.category as string);

        // On épingle les catégories choisies en admin d'abord
        const pinnedCategories = configs.filter((c: any) => c.isPinned).map((c: any) => c.name);

        // Fusionner thèmes saisonniers et thèmes de la DB (sans doublons)
        const uniqueCategories = Array.from(new Set([...pinnedCategories, ...seasonalThemes, ...dbCategories])).slice(0, 4);

        // On retourne des objets avec le nom, le compte et le top auteur
        const finalResults = [];
        for (const name of uniqueCategories) {
            const config = configMap.get(name);
            const count = countMap.get(name) || 0;

            // Vérifier si le badge manuel est expiré
            let manualBadge = config?.badge || null;
            if (manualBadge && config?.badgeExpiresAt) {
                const expires = new Date(config.badgeExpiresAt);
                if (expires < new Date()) {
                    manualBadge = null; // Badge expiré
                }
            }

            // Priorité : Badge manuel (non expiré) > TRENDING
            const finalBadge = manualBadge || (trendingCats.has(name) ? 'TRENDING' : null);

            // Trouver le top auteur pour cette catégorie
            const topAuthorResult = await prisma.product.groupBy({
                by: ['author'],
                where: { category: name, active: true },
                _count: { author: true },
                orderBy: { _count: { author: 'desc' } },
                take: 1
            });

            // Trouver le prix minimum pour cette catégorie
            const minPriceResult = await prisma.product.aggregate({
                where: { category: name, active: true },
                _min: { price: true }
            });

            finalResults.push({
                name,
                count,
                badge: finalBadge,
                badgeColor: config?.badgeColor || null,
                badgeExpiresAt: config?.badgeExpiresAt || null,
                topAuthor: topAuthorResult[0]?.author || null,
                minPrice: minPriceResult._min.price || 0,
                quote: config?.quote || null,
                quoteSource: config?.quoteSource || null,
                avgDiscount: 0,
                isFreeDelivery: false
            });

            // Calculer la réduction moyenne pour cette catégorie
            const booksWithDiscount = await prisma.product.findMany({
                where: {
                    category: name,
                    active: true,
                    originalPrice: { not: null }
                },
                select: { price: true, originalPrice: true }
            });

            if (booksWithDiscount.length > 0) {
                const discounts = booksWithDiscount.map(b => {
                    if (!b.originalPrice || b.originalPrice <= b.price) return 0;
                    return ((b.originalPrice - b.price) / b.originalPrice) * 100;
                }).filter(d => d > 0);

                if (discounts.length > 0) {
                    const avg = Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length);
                    // Update the last pushed item
                    finalResults[finalResults.length - 1].avgDiscount = avg;

                    // Si on a une promotion > 0, on met à jour le badge si pas de badge manuel
                    if (avg > 0 && !manualBadge && !finalResults[finalResults.length - 1].badge) {
                        finalResults[finalResults.length - 1].badge = 'PROMO';
                        finalResults[finalResults.length - 1].badgeColor = 'bg-red-500';
                    }
                }
            }

            // Calculer le prix moyen pour déterminer si Livraison Gratuite (Seuil > 200 MAD)
            const avgPriceResult = await prisma.product.aggregate({
                where: { category: name, active: true },
                _avg: { price: true }
            });
            const avgPrice = avgPriceResult._avg.price || 0;
            const isFreeDelivery = avgPrice > 200;

            finalResults[finalResults.length - 1].isFreeDelivery = isFreeDelivery;

            // Priorité: PROMO (déjà set) > LIVRAISON
            if (isFreeDelivery && !manualBadge && !finalResults[finalResults.length - 1].badge) {
                finalResults[finalResults.length - 1].badge = 'LIVRAISON';
                finalResults[finalResults.length - 1].badgeColor = 'bg-emerald-500';
            }
        }

        return finalResults;
    } catch (error) {
        console.error('Erreur categories populaires:', error)
        return [
            { name: 'Religion', count: 0 },
            { name: 'Développement', count: 0 },
            { name: 'Histoire', count: 0 },
            { name: 'Littérature', count: 0 }
        ]
    }
}

export async function getCategoryConfigByName(name: string) {
    try {
        return await (prisma as any).categoryConfig.findUnique({
            where: { name }
        });
    } catch (error) {
        return null;
    }
}

export async function getAllCategoryQuotes() {
    try {
        return await (prisma as any).categoryConfig.findMany({
            where: {
                quote: { not: null }
            }
        });
    } catch (error) {
        return [];
    }
}
