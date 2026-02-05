// Script de seed simple en JavaScript pur
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Démarrage du seed...')

    try {
        // 1. Admin
        console.log('👤 Création de l\'admin...')
        const hashedPassword = await bcrypt.hash('admin123', 10)

        await prisma.user.deleteMany({}) // Clean
        const admin = await prisma.user.create({
            data: {
                email: 'admin@riwaya.com',
                password: hashedPassword,
                role: 'ADMIN',
            },
        })
        console.log(`✅ Admin créé: ${admin.email}`)

        // 2. Livres
        console.log('\n📚 Création des livres...')
        await prisma.book.deleteMany({}) // Clean

        const booksData = [
            { title: 'Atomic Habits', author: 'James Clear', description: 'Un guide pratique pour créer de bonnes habitudes.', isbn: '9780735211292', price: 150, stock: 50, image: '/images/books/atomic-habits.jpg', category: 'Développement personnel' },
            { title: 'Deep Work', author: 'Cal Newport', description: 'Règles pour une concentration réussie.', isbn: '9781455586691', price: 180, stock: 35, image: '/images/books/deep-work.jpg', category: 'Productivité' },
            { title: 'The 48 Laws of Power', author: 'Robert Greene', description: 'Les 48 lois du pouvoir.', isbn: '9780140280197', price: 200, stock: 25, image: '/images/books/48-laws.jpg', category: 'Stratégie' },
            { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', description: 'Les deux systèmes de pensée.', isbn: '9780374533557', price: 220, stock: 30, image: '/images/books/thinking-fast-slow.jpg', category: 'Psychologie' },
            { title: 'The Lean Startup', author: 'Eric Ries', description: 'Innovation continue pour entrepreneurs.', isbn: '9780307887894', price: 170, stock: 40, image: '/images/books/lean-startup.jpg', category: 'Business' },
            { title: 'Sapiens', author: 'Yuval Noah Harari', description: 'Une brève histoire de l\'humanité.', isbn: '9780062316097', price: 250, stock: 20, image: '/images/books/sapiens.jpg', category: 'Histoire' },
            { title: 'The Psychology of Money', author: 'Morgan Housel', description: 'Leçons sur la richesse.', isbn: '9780857197689', price: 160, stock: 45, image: '/images/books/psychology-money.jpg', category: 'Finance' },
            { title: 'Start with Why', author: 'Simon Sinek', description: 'Comment les leaders inspirent.', isbn: '9781591846444', price: 175, stock: 38, image: '/images/books/start-with-why.jpg', category: 'Leadership' },
            { title: 'The 7 Habits', author: 'Stephen Covey', description: 'Guide de développement personnel.', isbn: '9781982137274', price: 190, stock: 42, image: '/images/books/7-habits.jpg', category: 'Développement personnel' },
            { title: 'Zero to One', author: 'Peter Thiel', description: 'Notes sur les startups.', isbn: '9780804139298', price: 165, stock: 33, image: '/images/books/zero-to-one.jpg', category: 'Business' },
        ]

        const books = []
        for (const bookData of booksData) {
            const book = await prisma.book.create({ data: bookData })
            books.push(book)
            console.log(`  ✓ ${book.title}`)
        }
        console.log(`✅ ${books.length} livres créés`)

        // 3. Packs
        console.log('\n📦 Création des packs...')
        await prisma.packBook.deleteMany({}) // Clean relations
        await prisma.pack.deleteMany({}) // Clean packs

        const pack1 = await prisma.pack.create({
            data: {
                name: 'Pack Développement Personnel',
                description: 'Les 3 meilleurs livres pour transformer votre vie.',
                price: 450,
                image: '/images/packs/dev-perso.jpg',
                books: {
                    create: [
                        { bookId: books[0].id },
                        { bookId: books[8].id },
                        { bookId: books[7].id },
                    ],
                },
            },
        })
        console.log(`  ✓ ${pack1.name}`)

        const pack2 = await prisma.pack.create({
            data: {
                name: 'Pack Business & Entrepreneuriat',
                description: 'Tout pour lancer votre entreprise.',
                price: 480,
                image: '/images/packs/business.jpg',
                books: {
                    create: [
                        { bookId: books[4].id },
                        { bookId: books[9].id },
                        { bookId: books[7].id },
                    ],
                },
            },
        })
        console.log(`  ✓ ${pack2.name}`)

        const pack3 = await prisma.pack.create({
            data: {
                name: 'Pack Productivité & Performance',
                description: 'Maximisez votre efficacité.',
                price: 310,
                image: '/images/packs/productivite.jpg',
                books: {
                    create: [
                        { bookId: books[1].id },
                        { bookId: books[0].id },
                    ],
                },
            },
        })
        console.log(`  ✓ ${pack3.name}`)

        console.log(`✅ 3 packs créés`)
        console.log('\n🎉 Seed terminé avec succès!')
        console.log('\n📊 Résumé:')
        console.log(`  - 1 admin`)
        console.log(`  - ${books.length} livres`)
        console.log(`  - 3 packs`)
    } catch (error) {
        console.error('❌ Erreur:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
