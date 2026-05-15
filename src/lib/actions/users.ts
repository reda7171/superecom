'use server'

import { prisma } from '@/lib/prisma'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function getUsers() {
    try {
        await verifyAdmin()
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isBanned: true,
                createdAt: true,
                phone: true,
            }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: 'Impossible de récupérer les utilisateurs' }
    }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    try {
        await verifyAdmin()
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de la modification du rôle' }
    }
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
    try {
        await verifyAdmin()
        await prisma.user.update({
            where: { id: userId },
            data: { isBanned }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors du bannissement' }
    }
}

export async function deleteUser(userId: string) {
    try {
        await verifyAdmin()
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}

export async function createUserAdmin(data: any) {
    try {
        await verifyAdmin()
        if (!data.email || !data.password) return { success: false, error: 'Email et mot de passe requis' }
        
        const hashedPassword = await hash(data.password, 10)
        await prisma.user.create({
            data: {
                email: data.email,
                fullName: data.fullName,
                password: hashedPassword,
                role: data.role as UserRole,
            }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Email déjà utilisé' }
        return { success: false, error: 'Erreur lors de la création' }
    }
}

export async function getLoginHistory(userId: string) {
    try {
        await verifyAdmin()
        const history = await prisma.loginHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limiter aux 50 dernières connexions
        })
        return { success: true, data: history }
    } catch (error) {
        return { success: false, error: 'Impossible de récupérer l\'historique des connexions' }
    }
}

export async function getGlobalLoginHistory() {
    try {
        await verifyAdmin()
        const history = await prisma.loginHistory.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        fullName: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })
        return { success: true, data: history }
    } catch (error) {
        return { success: false, error: 'Impossible de récupérer l\'historique global' }
    }
}


