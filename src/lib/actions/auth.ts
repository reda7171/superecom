'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createAuditLog } from './audit'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

const LoginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginResult =
    | { success: true; redirect: string }
    | { success: false; error: string }

/**
 * Connexion admin
 */
export async function login(email: string, password: string): Promise<LoginResult> {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`login_${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 }) // 5 essais par 15 min

    if (!limiter.success) {
        return { success: false, error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." }
    }

    try {
        const validatedData = LoginSchema.parse({ email, password })

        // Rechercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (!user) {
            return {
                success: false,
                error: 'Email ou mot de passe incorrect',
            }
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

        if (!isPasswordValid) {
            return {
                success: false,
                error: 'Email ou mot de passe incorrect',
            }
        }

        // Créer un token simple (dans un vrai projet, utiliser JWT)
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

        // Stocker le token dans un cookie
        const cookieStore = await cookies()
        cookieStore.set('admin-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 jours
            path: '/',
        })

        // Stocker l'email pour l'audit (non sensible)
        cookieStore.set('admin-email', user.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        await createAuditLog({
            action: 'LOGIN',
            entity: 'AUTH',
            details: `Connexion réussie: ${user.email}`
        })

        return {
            success: true,
            redirect: '/admin',
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            }
        }

        return {
            success: false,
            error: 'Une erreur est survenue lors de la connexion',
        }
    }
}

/**
 * Déconnexion admin
 */
export async function logout() {
    await createAuditLog({
        action: 'LOGOUT',
        entity: 'AUTH'
    })
    const cookieStore = await cookies()
    cookieStore.delete('admin-token')
    cookieStore.delete('admin-email')
}

/**
 * Vérifier si l'utilisateur est authentifié avec une validation basique du token
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) return false

    try {
        // Décodage du token (format base64(userId:timestamp))
        const decoded = Buffer.from(token, 'base64').toString('ascii')
        const [userId, timestamp] = decoded.split(':')

        if (!userId || !timestamp) return false

        // Vérifier si le token a moins de 7 jours (sécurité supplémentaire)
        const tokenTime = parseInt(timestamp)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (Date.now() - tokenTime > sevenDays) return false

        return true
    } catch (e) {
        return false
    }
}

/**
 * Assurer que l'utilisateur est un admin (lance une erreur sinon)
 * À utiliser au début des Server Actions sensibles
 */
export async function verifyAdmin() {
    const isAuth = await isAuthenticated()
    if (!isAuth) {
        throw new Error('Non autorisé - Accès administrateur requis')
    }
}

export async function getAdminUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) return null

    try {
        const decoded = Buffer.from(token, 'base64').toString('ascii')
        const [userId] = decoded.split(':')
        return userId
    } catch {
        return null
    }
}

