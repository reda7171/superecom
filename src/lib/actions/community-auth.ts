'use server'

import { prisma } from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import crypto from 'crypto'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'

const RegisterSchema = z.object({
    fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    city: z.string().min(2, 'La ville est requise'),
})

const LoginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
})

export type AuthResult =
    | { success: true; redirect: string }
    | { success: false; error: string }

/**
 * Inscription nouveau membre
 */
export async function register(formData: FormData): Promise<AuthResult> {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`community_register_${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 }) // 3 inscriptions par heure par IP

    if (!limiter.success) {
        return { success: false, error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.' }
    }

    const rawData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        city: formData.get('city'),
    }

    try {
        const data = RegisterSchema.parse(rawData)

        // Vérifier si email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return { success: false, error: 'Cet email est déjà utilisé' }
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                password: hashedPassword,
                city: data.city,
                role: 'USER' as any, // Cast car enum généré peut-être pas à jour dans l'IDE
                credits: 10, // Cadeau de bienvenue
            }
        })

        // Notification Telegram
        try {
            const { sendUserRegistrationNotification } = await import('@/lib/telegram')
            await sendUserRegistrationNotification({
                fullName: user.fullName || '',
                email: user.email,
                city: user.city || '',
                role: 'LECTEUR'
            })
        } catch (e) {
            console.error('Telegram notification error:', e)
        }

        // Auto-login
        await createSession(user.id)

        return { success: true, redirect: '/community' }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: 'Une erreur est survenue lors de l\'inscription' }
    }
}

/**
 * Connexion membre
 */
export async function login(formData: FormData): Promise<AuthResult> {
    const ip = await getIpIdentifier()
    const limiter = await rateLimit(`community_login_${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 }) // 10 essais par 15 min

    if (!limiter.success) {
        return { success: false, error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' }
    }

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    try {
        const data = LoginSchema.parse(rawData)

        const user = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (!user) {
            return { success: false, error: 'Email ou mot de passe incorrect' }
        }

        const isValid = await bcrypt.compare(data.password, user.password)

        if (!isValid) {
            return { success: false, error: 'Email ou mot de passe incorrect' }
        }

        await createSession(user.id)

        return { success: true, redirect: '/community' }

    } catch (error) {
        return { success: false, error: 'Erreur de connexion' }
    }
}

/**
 * Déconnexion
 */
export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('community-token')
}

/**
 * Session Management (Basic)
 */
async function createSession(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { locale: true }
    })

    const timestamp = Date.now().toString()
    const payload = `${userId}:${timestamp}`
    const secret = process.env.JWT_SECRET || 'default_secure_secret_for_riwaya'
    
    let signature = ''
    if (typeof crypto !== 'undefined' && crypto.createHmac) {
        signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    }
    
    const token = Buffer.from(`${payload}:${signature}`).toString('base64')
    
    const cookieStore = await cookies()
    cookieStore.set('community-token', token, {
        httpOnly: true,
        secure: false, // Forcer à false pour permettre la connexion via IP/HTTP sur VPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 jours
        path: '/',
    })

    if (user?.locale) {
        cookieStore.set('NEXT_LOCALE', user.locale, { path: '/' })
    }
}

export async function getCommunityUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('community-token')

    if (!token) return null

    try {
        // Decode token format: userId:timestamp:signature
        const decoded = Buffer.from(token.value, 'base64').toString('utf-8')
        const [userId, timestamp, signature] = decoded.split(':')

        if (!userId || !timestamp) return null

        // Vérification signature
        const payload = `${userId}:${timestamp}`
        const secret = process.env.JWT_SECRET || 'default_secure_secret_for_riwaya'
        if (typeof crypto !== 'undefined' && crypto.createHmac) {
            const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
            if (!signature || signature !== expectedSignature) {

                return null
            }
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                ownedBooks: true,
            }
        })

        return user
    } catch {
        return null
    }
}

/**
 * Vérifie si un utilisateur community est éligible au système d'échange
 * Règle: Avoir passé au moins une commande (basé sur l'email ou le téléphone)
 */
export async function checkExchangeEligibility(user: any): Promise<boolean> {
    if (!user) return false
    if (user.role === 'ADMIN') return true

    const conditions: any[] = []
    if (user.email) conditions.push({ email: user.email })
    if (user.phone) conditions.push({ phone: user.phone })

    if (conditions.length === 0) return false

    const orderCount = await prisma.order.count({
        where: {
            OR: conditions
        }
    })

    return orderCount > 0
}
