'use server'

import { prisma } from '@/lib/prisma'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

// Récupérer tous les paramètres
export async function getAllSettings() {
    try {
        const settings = await prisma.siteSettings.findMany({
            orderBy: [
                { category: 'asc' },
                { key: 'asc' }
            ]
        })

        // Convertir en objet clé-valeur pour faciliter l'utilisation
        const settingsMap: Record<string, string> = {}
        settings.forEach(setting => {
            settingsMap[setting.key] = setting.value || ''
        })

        return settingsMap
    } catch (error) {
        console.error('Error fetching settings:', error)
        return {}
    }
}

// Récupérer un paramètre spécifique
export async function getSetting(key: string) {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key }
        })
        return setting?.value || null
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error)
        return null
    }
}

// Mettre à jour ou créer un paramètre
export async function updateSetting(key: string, value: string, category: string = 'general', description?: string) {
    try {
        await verifyAdmin()

        const setting = await prisma.siteSettings.upsert({
            where: { key },
            update: { value, category, description },
            create: { key, value, category, description }
        })

        revalidatePath('/admin/settings')
        revalidatePath('/')

        return { success: true, setting }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Mettre à jour plusieurs paramètres en une fois
export async function updateMultipleSettings(settings: { key: string; value: string; category?: string; description?: string }[]) {
    try {
        await verifyAdmin()

        await prisma.$transaction(
            settings.map(({ key, value, category = 'general', description }) =>
                prisma.siteSettings.upsert({
                    where: { key },
                    update: { value, category, description },
                    create: { key, value, category, description }
                })
            )
        )

        revalidatePath('/admin/settings')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Supprimer un paramètre
export async function deleteSetting(key: string) {
    try {
        await verifyAdmin()

        await prisma.siteSettings.delete({
            where: { key }
        })

        revalidatePath('/admin/settings')

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Récupérer les paramètres par catégorie
export async function getSettingsByCategory(category: string) {
    try {
        const settings = await prisma.siteSettings.findMany({
            where: { category },
            orderBy: { key: 'asc' }
        })

        const settingsMap: Record<string, string> = {}
        settings.forEach(setting => {
            settingsMap[setting.key] = setting.value || ''
        })

        return settingsMap
    } catch (error) {
        console.error(`Error fetching settings for category ${category}:`, error)
        return {}
    }
}
