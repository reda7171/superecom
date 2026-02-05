/**
 * Analyse une requête de recherche pour extraire des filtres de prix naturels.
 * Ex: "Livres à moins de 100 MAD" -> { maxPrice: 100, cleanQuery: "Livres MAD" }
 */
export function parsePriceFilter(query: string) {
    const terms = query.toLowerCase();

    // Pattern pour le prix maximum (ex: "moins de 100", "under 100", "max 100")
    const maxPricePatterns = [
        /(?:moins de|under|max|<|à moins de|jusqu'à|up to)\s*(\d+)/i,
        /(\d+)\s*(?:mad|dh|dirhams?)\s*(?:maximum|max)/i
    ];

    // Pattern pour le prix minimum (ex: "plus de 100", "over 100", "min 100")
    const minPricePatterns = [
        /(?:plus de|over|min|>|à partir de|from)\s*(\d+)/i,
        /(\d+)\s*(?:mad|dh|dirhams?)\s*(?:minimum|min)/i
    ];

    // Pattern pour une fourchette (ex: "entre 100 et 200")
    const rangePattern = /(?:entre|between)\s*(\d+)\s*(?:et|and)\s*(\d+)/i;

    let maxPrice: number | undefined;
    let minPrice: number | undefined;
    let cleanQuery = query;

    const rangeMatch = terms.match(rangePattern);
    if (rangeMatch) {
        minPrice = parseInt(rangeMatch[1]);
        maxPrice = parseInt(rangeMatch[2]);
        cleanQuery = cleanQuery.replace(rangeMatch[0], '').trim();
    } else {
        // Chercher le prix max
        for (const pattern of maxPricePatterns) {
            const match = cleanQuery.match(pattern);
            if (match) {
                maxPrice = parseInt(match[1]);
                cleanQuery = cleanQuery.replace(match[0], '').trim();
                break;
            }
        }

        // Chercher le prix min
        for (const pattern of minPricePatterns) {
            const match = cleanQuery.match(pattern);
            if (match) {
                minPrice = parseInt(match[1]);
                cleanQuery = cleanQuery.replace(match[0], '').trim();
                break;
            }
        }
    }

    // Nettoyer la requête des termes monétaires isolés restant si un prix a été trouvé
    if (maxPrice !== undefined || minPrice !== undefined) {
        cleanQuery = cleanQuery.replace(/\b(?:mad|dh|dirhams?|dhs)\b/gi, '').trim();
    }

    return {
        minPrice,
        maxPrice,
        cleanQuery: cleanQuery.replace(/\s+/g, ' ').trim() || undefined
    };
}
