const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seed: Démarrage...')

    // Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@riwaya.com' },
        update: {},
        create: {
            email: 'admin@riwaya.com',
            password: hashedPassword,
            role: 'ADMIN', // Enum UserRole
        },
    })
    console.log('✅ Admin créé:', admin.email)

    // Livres
    const books = await Promise.all([
        prisma.book.create({
            data: {
                title: 'Atomic Habits',
                author: 'James Clear',
                description: 'Un guide pratique pour créer de bonnes habitudes et éliminer les mauvaises.',
                isbn: '9780735211292',
                price: 150,
                stock: 50,
                image: '/images/books/atomic-habits.jpg',
                category: 'Développement personnel',
            },
        }),
        prisma.book.create({
            data: {
                title: 'Deep Work',
                author: 'Cal Newport',
                description: 'Règles pour une concentration réussie dans un monde distrait.',
                isbn: '9781455586691',
                price: 180,
                stock: 30,
                image: '/images/books/deep-work.jpg',
                category: 'Productivité',
            },
        }),
        prisma.book.create({
            data: {
                title: 'The 48 Laws of Power',
                author: 'Robert Greene',
                description: 'Les 48 lois du pouvoir pour réussir dans la vie.',
                isbn: '9780140280197',
                price: 200,
                stock: 25,
                image: '/images/books/48-laws.jpg',
                category: 'Stratégie',
            },
        }),
    ])
    console.log(`✅ ${books.length} livres créés`)

    // Pack
    const pack = await prisma.pack.create({
        data: {
            name: 'Pack Développement Personnel',
            description: 'Les 3 meilleurs livres pour transformer votre vie',
            price: 450,
            image: '/images/packs/dev-perso.jpg',
            books: {
                create: books.map((book) => ({
                    bookId: book.id,
                })),
            },
        },
    })
    console.log('✅ Pack créé:', pack.name)

    console.log('🎉 Seed terminé avec succès!')
}

main()
    .catch((e) => {
        console.error('❌ Erreur seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
