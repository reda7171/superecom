import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const posts = [
    {
        title: '10 livres qui vont transformer votre vie en 2024',
        slug: '10-livres-transformer-vie-2024',
        excerpt: 'Découvrez notre sélection des meilleurs livres de développement personnel pour cette année.',
        content: `# Introduction\n\nLe développement personnel est un voyage constant. Voici notre sélection des 10 livres incontournables pour 2024.\n\n## 1. Atomic Habits - James Clear\n\nCe livre révolutionnaire vous apprend comment de petits changements peuvent mener à des résultats extraordinaires.\n\n## 2. Le pouvoir du moment présent - Eckhart Tolle\n\nUn guide spirituel qui vous aide à vivre pleinement chaque instant.\n\n## 3. Les 4 accords Toltèques - Don Miguel Ruiz\n\nQuatre principes simples mais puissants pour transformer votre vie.\n\n## Conclusion\n\nCes livres ont le pouvoir de changer votre perspective et d'améliorer votre quotidien.`,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
        published: true,
        publishedAt: new Date('2024-01-15')
    },
    {
        title: 'Comment développer une habitude de lecture quotidienne',
        slug: 'developper-habitude-lecture-quotidienne',
        excerpt: 'Des conseils pratiques pour lire plus et mieux chaque jour.',
        content: `# Pourquoi lire tous les jours ?\n\nLa lecture quotidienne apporte de nombreux bénéfices :\n- Amélioration de la concentration\n- Réduction du stress\n- Enrichissement du vocabulaire\n- Développement de l'empathie\n\n## Conseils pour créer l'habitude\n\n### 1. Commencez petit\nNe vous fixez pas l'objectif de lire 50 pages par jour. Commencez par 10 minutes.\n\n### 2. Choisissez le bon moment\nLe matin au réveil ou le soir avant de dormir sont des moments idéaux.\n\n### 3. Ayez toujours un livre à portée de main\nGardez un livre dans votre sac, sur votre table de chevet, partout !\n\n## Conclusion\n\nLa lecture est un muscle qui se développe avec la pratique.`,
        coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
        published: true,
        publishedAt: new Date('2024-01-20')
    },
    {
        title: 'Les bienfaits de la lecture sur le cerveau',
        slug: 'bienfaits-lecture-cerveau',
        excerpt: 'La science démontre que la lecture transforme littéralement votre cerveau.',
        content: `# La lecture : un entraînement pour le cerveau\n\nDes études scientifiques récentes montrent que la lecture a des effets mesurables sur notre cerveau.\n\n## Amélioration de la connectivité neuronale\n\nLa lecture stimule la création de nouvelles connexions entre les neurones.\n\n## Réduction du déclin cognitif\n\nLire régulièrement peut retarder l'apparition de maladies comme Alzheimer.\n\n## Développement de l'empathie\n\nLa lecture de fiction améliore notre capacité à comprendre les émotions des autres.\n\n## Conclusion\n\nLire n'est pas qu'un passe-temps, c'est un investissement dans votre santé mentale.`,
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
        published: true,
        publishedAt: new Date('2024-02-01')
    },
    {
        title: 'Guide complet : Comment choisir son prochain livre',
        slug: 'guide-choisir-prochain-livre',
        excerpt: 'Ne perdez plus de temps à chercher. Voici comment trouver le livre parfait pour vous.',
        content: `# L'art de choisir le bon livre\n\nAvec des milliers de livres disponibles, comment choisir celui qui vous convient ?\n\n## 1. Identifiez vos objectifs\n\n- Voulez-vous apprendre quelque chose de nouveau ?\n- Cherchez-vous à vous évader ?\n- Souhaitez-vous vous développer personnellement ?\n\n## 2. Lisez les avis\n\nLes avis d'autres lecteurs sont précieux, mais gardez votre esprit critique.\n\n## 3. Lisez l'extrait\n\nLa plupart des librairies en ligne proposent un extrait gratuit.\n\n## 4. Faites confiance à votre instinct\n\nSi un livre vous appelle, c'est probablement le bon moment de le lire.\n\n## Conclusion\n\nLe meilleur livre est celui que vous lirez jusqu'au bout !`,
        coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
        published: true,
        publishedAt: new Date('2024-02-10')
    },
    {
        title: 'Top 5 des livres de business pour entrepreneurs',
        slug: 'top-5-livres-business-entrepreneurs',
        excerpt: 'Les lectures essentielles pour tout entrepreneur qui se respecte.',
        content: `# Les must-read pour entrepreneurs\n\nVoici notre sélection des 5 livres incontournables pour les entrepreneurs.\n\n## 1. Père Riche, Père Pauvre - Robert Kiyosaki\n\nLe classique qui change votre rapport à l'argent.\n\n## 2. La semaine de 4 heures - Tim Ferriss\n\nComment travailler moins et gagner plus.\n\n## 3. Start with Why - Simon Sinek\n\nDécouvrez votre "pourquoi" et inspirez les autres.\n\n## 4. Good to Great - Jim Collins\n\nLes secrets des entreprises qui excellent.\n\n## 5. The Lean Startup - Eric Ries\n\nLa méthodologie pour lancer une startup avec succès.\n\n## Conclusion\n\nCes livres sont des investissements qui rapportent bien plus que leur prix.`,
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
        published: true,
        publishedAt: new Date('2024-02-12')
    }
]

async function main() {
    console.log('📝 Ajout des articles de blog...')

    // Récupérer l'admin
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    })

    if (!admin) {
        console.error('❌ Aucun admin trouvé')
        return
    }

    // Créer les posts
    for (const post of posts) {
        await prisma.post.create({
            data: {
                ...post,
                authorId: admin.id
            }
        })
    }

    console.log(`✅ ${posts.length} articles créés`)
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
