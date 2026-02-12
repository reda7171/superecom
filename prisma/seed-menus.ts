import { prisma } from '../src/lib/prisma'

async function main() {
    console.log('🌱 Seed des menus...')

    // Support pour isActive
    const headerMenu = await prisma.menu.upsert({
        where: { slug: 'header' },
        update: {},
        create: {
            slug: 'header',
            name: 'Menu Principal',
            isActive: true
        }
    })

    const menuItems = [
        { label: 'Books', url: '/books', order: 1 },
        { label: 'Packs', url: '/packs', order: 2 },
        { label: 'Community', url: '/community/market', order: 3 },
        { label: 'Journal', url: '/blog', order: 4 },
        { label: 'Home', url: '/', order: 5 }
    ]

    for (const item of menuItems) {
        await prisma.menuItem.upsert({
            where: {
                id: `${headerMenu.id}-${item.label}` // Simuler un ID unique pour le seed
            },
            update: {
                label: item.label,
                url: item.url,
                order: item.order
            },
            create: {
                id: `${headerMenu.id}-${item.label}`,
                menuId: headerMenu.id,
                label: item.label,
                url: item.url,
                order: item.order,
                isActive: true
            }
        })
    }

    console.log('✅ Menu header créé avec succès')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
