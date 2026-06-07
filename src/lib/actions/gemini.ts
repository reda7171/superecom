'use server'

import { generateText as baseGenerateText } from "@/lib/gemini";
import { verifyAdmin } from "./auth";

export async function generatePostContent(
    input: string, 
    language: 'fr' | 'ar', 
    type: 'TITLE' | 'EXCERPT' | 'CONTENT' | 'SLUG' = 'CONTENT'
) {
    try {
        await verifyAdmin()

        if (!input) return { success: false, error: 'Une entrée est requise.' }

        let prompt = '';

        if (type === 'SLUG') {
            prompt = `Génère un slug d'URL SEO-friendly (en caractères latins, minuscules, séparés par des tirets) pour l'article suivant : "${input}". Réponds UNIQUEMENT avec le slug.`;
        } else if (type === 'TITLE') {
            prompt = language === 'fr'
                ? `Génère 5 titres d'articles de blog accrocheurs et professionnels en français pour une librairie nommée "SuperEcom" basés sur ces mots-clés : "${input}". Réponds UNIQUEMENT avec le meilleur titre, sans ponctuation inutile au début ou à la fin.`
                : `Génère 5 titres d'articles de blog accrocheurs et professionnels en arabe pour une librairie nommée "SuperEcom" basés sur ces mots-clés : "${input}". Réponds UNIQUEMENT avec le meilleur titre, sans ponctuation inutile au début ou à la fin.`;
        } else if (type === 'EXCERPT') {
            prompt = language === 'fr'
                ? `Rédige un court extrait (résumé) professionnel et intriguant en français (max 160 caractères) pour un article dont le sujet est : "${input}".`
                : `Rédige un court extrait (résumé) professionnel et intriguant en arabe (max 160 caractères) pour un article dont le sujet est : "${input}".`;
        } else {
            const structure = `
                1. Introduction (Accroche et pourquoi le lire)
                2. Informations générales (Titre, Auteur, Genre, Pages, etc.)
                3. Résumé (Court, sans spoiler)
                4. Les personnages (Principaux et secondaires)
                5. Les thèmes abordés
                6. Style d'écriture (Narration, ton, rythme)
                7. Les points forts
                8. Les points faibles
                9. Citation(s) marquante(s)
                10. Analyse / interprétation (Symbolisme, message)
                11. Comparaison (Si vous avez aimé X, vous aimerez Y)
                12. Adaptation (Film/Série si existante)
                13. Pour quel type de lecteur ?
                14. Note finale / avis personnel (Noter sur 5: Histoire, Style, Fin) + Note globale étoile
                FAQ (3 questions pertinentes)
            `;

            prompt = language === 'fr' 
                ? `Rédige un article de blog complet et professionnel pour la librairie "SuperEcom" sur le livre ou le thème suivant : "${input}". 
                   Tu DOIS impérativement suivre cette structure Markdown :
                   ${structure}
                   Rédige un contenu de haute qualité, optimisé pour le SEO et engageant.`
                : `Rédige un article de blog complet et professionnel pour la librairie "SuperEcom" sur le livre ou le thème suivant : "${input}". 
                   Tu DOIS impérativement suivre cette structure Markdown (en arabe) :
                   ${structure}
                   Rédige un contenu de haute qualité (en arabe), optimisé pour le SEO et engageant.`;
        }

        const content = await baseGenerateText(prompt);

        if (!content) return { success: false, error: 'Erreur lors de la génération.' }

        return { success: true, content: content.trim() }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
