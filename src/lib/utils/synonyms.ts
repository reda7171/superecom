/**
 * Dictionnaire de synonymes pour améliorer la pertinence de la recherche
 */
export const searchSynonyms: Record<string, string[]> = {
    'religion': ['islam', 'spiritualité', 'croyance', 'coran', 'sunnah'],
    'islam': ['religion', 'spiritualité', 'musulman'],
    'spiritualité': ['religion', 'islam', 'méditation', 'soufisme'],
    'développement': ['coaching', 'motivation', 'succès', 'psychologie', 'productivité'],
    'succès': ['motivation', 'développement', 'argent', 'richesse'],
    'histoire': ['biographie', 'mémoire', 'récit', 'passé'],
    'cuisine': ['recettes', 'gastronomie', 'santé', 'plat'],
    'santé': ['bien-être', 'sport', 'alimentation', 'médecine'],
    'roman': ['fiction', 'littérature', 'histoire', 'aventure'],
    'enfant': ['jeunesse', 'éducation', 'conte', 'pédagogie'],
}

/**
 * Étend une requête de recherche avec des synonymes
 */
export function expandQueryWithSynonyms(query: string): string {
    const words = query.toLowerCase().split(/\s+/)
    const expandedTerms = new Set<string>(words)

    words.forEach(word => {
        if (searchSynonyms[word]) {
            searchSynonyms[word].forEach(synonym => expandedTerms.add(synonym))
        }
    })

    return Array.from(expandedTerms).join(' ')
}
