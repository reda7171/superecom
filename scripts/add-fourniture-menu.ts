/**
 * Script : ajouter "Fourniture bureau" dans le menu header
 * Usage  : npx ts-node scripts/add-fourniture-menu.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Trouver le menu header
    const menu = await prisma.menu.findUnique({ where: { slug: 'header' } })

    if (!menu) {
        console.error('Menu "header" introuvable. Vérifiez que le menu existe en base.')
        process.exit(1)
    }

    // Vérifier si l'item existe déjà
    const existing = await prisma.menuItem.findFirst({
        where: { menuId: menu.id, url: '/fourniture-bureau' }
    })

    if (existing) {
        console.log('Item déjà existant :', existing.label)
        return
    }

    // Calculer le prochain ordre
    const lastItem = await prisma.menuItem.findFirst({
        where: { menuId: menu.id, parentId: null },
        orderBy: { order: 'desc' }
    })
    const nextOrder = (lastItem?.order ?? -1) + 1

    // Créer l'item
    const item = await prisma.menuItem.create({
        data: {
            menuId: menu.id,
            label: 'Fourniture bureau',
            url: '/fourniture-bureau',
            order: nextOrder,
            isActive: true,
        }
    })

    console.log('Item créé avec succès :', item)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
