
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding menus...')

    // Delete existing Header menu to ensure clean state
    const existingHeader = await prisma.menu.findUnique({ where: { slug: 'header' } })
    if (existingHeader) {
        await prisma.menu.delete({ where: { slug: 'header' } })
        console.log('Deleted existing header menu')
    }

    // Create Header Menu with Translation Keys
    const headerMenu = await prisma.menu.create({
        data: {
            slug: 'header',
            name: 'Menu Principal',
            isActive: true,
            items: {
                create: [
                    { label: 'Books', url: '/books', order: 1, isActive: true },
                    { label: 'Packs', url: '/packs', order: 2, isActive: true },
                    { label: 'Community', url: '/community/market', order: 3, isActive: true },
                    { label: 'Journal', url: '/blog', order: 4, isActive: true },
                    { label: 'Home', url: '/', order: 5, isActive: true },
                ]
            }
        }
    })

    console.log('Created header menu:', headerMenu)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
