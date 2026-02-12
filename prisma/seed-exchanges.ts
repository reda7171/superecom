import { prisma } from '../src/lib/prisma'
import { ExchangeType, ExchangeStatus, BookCondition } from '@prisma/client'

async function main() {
    console.log('🌱 Seed des échanges...')

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
        where: {
            email: {
                in: ['sara@example.com', 'mehdi@example.com', 'laila@example.com', 'karim@example.com']
            }
        }
    })

    if (users.length < 2) {
        console.error('❌ Pas assez d\'utilisateurs pour créer des échanges. Lancez d\'abord le seed principal.')
        return
    }

    const sara = users.find(u => u.email === 'sara@example.com')!
    const mehdi = users.find(u => u.email === 'mehdi@example.com')!
    const laila = users.find(u => u.email === 'laila@example.com')!
    const karim = users.find(u => u.email === 'karim@example.com')!

    // Nettoyage
    await prisma.exchange.deleteMany()
    await prisma.exchangeBook.deleteMany()

    console.log('📚 Création des livres d\'échange...')

    // Livres de Sara
    const saraBooks = await Promise.all([
        prisma.exchangeBook.create({
            data: {
                title: 'L\'Alchimiste',
                author: 'Paulo Coelho',
                ownerId: sara.id,
                condition: BookCondition.GOOD,
                description: 'Un classique du développement personnel. Quelques marques sur la couverture.',
                language: 'fr',
                exchangeType: ExchangeType.DIRECT,
                status: 'AVAILABLE',
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
            }
        }),
        prisma.exchangeBook.create({
            data: {
                title: 'Atomic Habits',
                author: 'James Clear',
                ownerId: sara.id,
                condition: BookCondition.NEW,
                description: 'Comme neuf, lu une seule fois.',
                language: 'en',
                exchangeType: ExchangeType.DIRECT,
                status: 'AVAILABLE',
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'
            }
        })
    ])

    // Livres de Mehdi
    const mehdiBooks = await Promise.all([
        prisma.exchangeBook.create({
            data: {
                title: 'Sapiens',
                author: 'Yuval Noah Harari',
                ownerId: mehdi.id,
                condition: BookCondition.GOOD,
                description: 'Très instructif. État correct.',
                language: 'fr',
                exchangeType: ExchangeType.DIRECT,
                status: 'AVAILABLE',
                image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400'
            }
        }),
        prisma.exchangeBook.create({
            data: {
                title: 'Le pouvoir du moment présent',
                author: 'Eckhart Tolle',
                ownerId: mehdi.id,
                condition: BookCondition.USED,
                description: 'Un peu usé mais tout à fait lisible.',
                language: 'fr',
                exchangeType: ExchangeType.GIVEAWAY,
                status: 'AVAILABLE',
                image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'
            }
        })
    ])

    // Livres de Laila
    const lailaBooks = await Promise.all([
        prisma.exchangeBook.create({
            data: {
                title: 'Père Riche Père Pauvre',
                author: 'Robert Kiyosaki',
                ownerId: laila.id,
                condition: BookCondition.GOOD,
                description: 'Excellent pour apprendre les bases de la finance.',
                language: 'fr',
                exchangeType: ExchangeType.CREDIT,
                status: 'AVAILABLE',
                image: 'https://images.unsplash.com/photo-1592492159418-39f319320569?auto=format&fit=crop&q=80&w=400'
            }
        })
    ])

    console.log('🤝 Création des demandes d\'échange...')

    // 1. Mehdi demande L'Alchimiste à Sara contre Sapiens
    await prisma.exchange.create({
        data: {
            requesterId: mehdi.id,
            responderId: sara.id,
            bookRequestedId: saraBooks[0].id,
            bookOfferedId: mehdiBooks[0].id,
            type: ExchangeType.DIRECT,
            status: ExchangeStatus.PENDING,
            message: 'Bonjour Sara, j\'aimerais échanger mon livre Sapiens contre ton Alchimiste. Qu\'en penses-tu ?'
        }
    })

    // 2. Laila demande Atomic Habits à Sara
    await prisma.exchange.create({
        data: {
            requesterId: laila.id,
            responderId: sara.id,
            bookRequestedId: saraBooks[1].id,
            type: ExchangeType.CREDIT,
            creditsAmount: 15,
            status: ExchangeStatus.ACCEPTED,
            message: 'Salut ! Je suis très intéressée par Atomic Habits. Je te propose 15 crédits.'
        }
    })

    // Mettre à jour le statut du livre pour l'échange accepté
    await prisma.exchangeBook.update({
        where: { id: saraBooks[1].id },
        data: { status: 'PENDING' }
    })

    // Mettre également à jour le livre demandé par Mehdi à PENDING car il y a une demande en cours
    await prisma.exchangeBook.update({
        where: { id: saraBooks[0].id },
        data: { status: 'PENDING' }
    })

    // 3. Karim demande Le pouvoir du moment présent à Mehdi (GIVEAWAY)
    await prisma.exchange.create({
        data: {
            requesterId: karim.id,
            responderId: mehdi.id,
            bookRequestedId: mehdiBooks[1].id,
            type: ExchangeType.GIVEAWAY,
            status: ExchangeStatus.PENDING,
            message: 'Salam Mehdi, est-ce que ce livre de don est toujours disponible ? Merci !'
        }
    })

    console.log('✅ Seed des échanges terminé !')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
