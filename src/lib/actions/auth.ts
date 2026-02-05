'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

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
    const cookieStore = await cookies()
    cookieStore.delete('admin-token')
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')
    return !!token
}
