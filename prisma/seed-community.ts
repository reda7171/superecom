import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Début du seeding...')

    // Créer des utilisateurs de test
    const users = []
    const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir']

    for (let i = 1; i <= 5; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10)
        const user = await prisma.user.upsert({
            where: { email: `user${i}@riwaya.com` },
            update: {},
            create: {
                email: `user${i}@riwaya.com`,
                password: hashedPassword,
                fullName: `Utilisateur ${i}`,
                city: cities[i % cities.length],
                role: 'USER',
                credits: 10 + (i * 5),
                rating: 4.0 + (i * 0.2),
                image: `https://api.dicebear.com/7.x/notionists/svg?seed=user${i}`,
                bio: `Passionné de lecture depuis toujours. J'adore échanger des livres !`,
            }
        })
        users.push(user)
        console.log(`✅ Utilisateur créé: ${user.email}`)
    }

    // Livres de test avec vraies données
    const booksData = [
        { title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
        { title: '1984', author: 'George Orwell', condition: 'NEW', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
        { title: "L'Alchimiste", author: 'Paulo Coelho', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
        { title: 'Harry Potter à l\'école des sorciers', author: 'J.K. Rowling', condition: 'USED', image: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400' },
        { title: 'Le Seigneur des Anneaux', author: 'J.R.R. Tolkien', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?w=400' },
        { title: 'Sapiens', author: 'Yuval Noah Harari', condition: 'NEW', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400' },
        { title: 'Les Misérables', author: 'Victor Hugo', condition: 'USED', image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400' },
        { title: 'Atomic Habits', author: 'James Clear', condition: 'NEW', image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400' },
        { title: 'L\'Étranger', author: 'Albert Camus', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' },
        { title: 'Le Comte de Monte-Cristo', author: 'Alexandre Dumas', condition: 'USED', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400' },
        { title: 'Orgueil et Préjugés', author: 'Jane Austen', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400' },
        { title: 'Le Prophète', author: 'Khalil Gibran', condition: 'NEW', image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400' },
        { title: 'La Peste', author: 'Albert Camus', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
        { title: 'Le Vieil Homme et la Mer', author: 'Ernest Hemingway', condition: 'USED', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' },
        { title: 'Fahrenheit 451', author: 'Ray Bradbury', condition: 'GOOD', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
    ]

    // Créer des livres pour chaque utilisateur
    let bookCount = 0
    for (const user of users) {
        // Chaque utilisateur a 3-4 livres
        const numBooks = 3 + (users.indexOf(user) % 2)

        for (let i = 0; i < numBooks; i++) {
            const bookData = booksData[bookCount % booksData.length]

            await prisma.exchangeBook.create({
                data: {
                    ownerId: user.id,
                    title: bookData.title,
                    author: bookData.author,
                    condition: bookData.condition as any,
                    image: bookData.image,
                    description: `Un excellent livre en ${bookData.condition === 'NEW' ? 'parfait état' : bookData.condition === 'GOOD' ? 'bon état' : 'état correct'}. Disponible pour échange.`,
                    exchangeType: i % 2 === 0 ? 'DIRECT' : 'CREDIT',
                    status: 'AVAILABLE',
                    language: 'fr',
                }
            })

            bookCount++
        }

        console.log(`📚 ${numBooks} livres créés pour ${user.fullName}`)
    }

    console.log('✨ Seeding terminé avec succès!')
    console.log(`👥 ${users.length} utilisateurs créés`)
    console.log(`📖 ${bookCount} livres d'échange créés`)
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
