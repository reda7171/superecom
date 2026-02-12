'use server'

import { prisma } from '@/lib/prisma'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

export type MenuItemWithChildren = {
    id: string
    label: string
    url: string
    order: number
    isActive: boolean
    parentId: string | null
    children?: MenuItemWithChildren[]
}

// Récupérer un menu actif par son slug
export async function getActiveMenuBySlug(slug: string) {
    try {
        // Utilisation de queryRaw pour contourner les problèmes de client Prisma obsolète
        const menus: any[] = await prisma.$queryRaw`SELECT * FROM menus WHERE slug = ${slug} AND isActive = 1 LIMIT 1`

        if (!menus || menus.length === 0) return null

        const menu = menus[0]

        // Récupérer les items du menu
        const items: any[] = await prisma.$queryRaw`SELECT * FROM menu_items WHERE menuId = ${menu.id} AND isActive = 1 ORDER BY \`order\` ASC`

        // Structure hiérarchique simple (1 niveau pour le header)
        const rootItems = items.filter(item => !item.parentId)

        return {
            ...menu,
            items: rootItems
        }
    } catch (error) {
        console.error('Error in getActiveMenuBySlug:', error)
        return null
    }
}

// Récupérer tous les menus
export async function getAllMenus() {
    return prisma.menu.findMany({
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        }
    })
}

// Récupérer un menu avec ses items (structure hiérarchique)
export async function getMenuWithItems(menuId: string) {
    const menu = await prisma.menu.findUnique({
        where: { id: menuId },
        include: {
            items: {
                orderBy: { order: 'asc' },
                include: {
                    children: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    })

    if (!menu) return null

    // Organiser en structure hiérarchique
    const rootItems = menu.items.filter(item => !item.parentId)

    return {
        ...menu,
        items: rootItems
    }
}

// Créer un nouveau menu
export async function createMenu(data: { name: string; label: string }) {
    try {
        await verifyAdmin()

        const menu = await prisma.menu.create({
            data: {
                name: data.name,
                label: data.label
            }
        })

        revalidatePath('/admin/menus')
        return { success: true, menu }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Créer un item de menu
export async function createMenuItem(data: {
    menuId: string
    label: string
    url: string
    parentId?: string | null
    order?: number
}) {
    try {
        await verifyAdmin()

        const item = await prisma.menuItem.create({
            data: {
                menuId: data.menuId,
                label: data.label,
                url: data.url,
                parentId: data.parentId || null,
                order: data.order || 0
            }
        })

        revalidatePath('/admin/menus')
        return { success: true, item }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Mettre à jour un item de menu
export async function updateMenuItem(id: string, data: {
    label?: string
    url?: string
    isActive?: boolean
    order?: number
}) {
    try {
        await verifyAdmin()

        const item = await prisma.menuItem.update({
            where: { id },
            data
        })

        revalidatePath('/admin/menus')
        return { success: true, item }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Supprimer un item de menu
export async function deleteMenuItem(id: string) {
    try {
        await verifyAdmin()

        await prisma.menuItem.delete({
            where: { id }
        })

        revalidatePath('/admin/menus')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Mettre à jour l'ordre des items
export async function updateMenuOrder(items: { id: string; order: number }[]) {
    try {
        await verifyAdmin()

        await prisma.$transaction(
            items.map(item =>
                prisma.menuItem.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        revalidatePath('/admin/menus')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Supprimer un menu
export async function deleteMenu(id: string) {
    try {
        await verifyAdmin()

        await prisma.menu.delete({
            where: { id }
        })

        revalidatePath('/admin/menus')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Mettre à jour un menu (toggle isActive)
export async function updateMenu(id: string, data: { isActive?: boolean, name?: string }) {
    try {
        await verifyAdmin()

        await prisma.menu.update({
            where: { id },
            data
        })

        revalidatePath('/admin/menus')
        revalidatePath('/') // Revalider la page d'accueil
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
