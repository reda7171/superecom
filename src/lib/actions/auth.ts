'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import crypto from 'crypto'
import { createAuditLog } from './audit'
import { rateLimit, getIpIdentifier } from '@/lib/rate-limit'
import { sendTelegramMessage } from '@/lib/telegram'

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
        sendTelegramMessage(`🚨 *Alerte Sécurité*\nTrop de tentatives de connexion bloquées.\n🌐 IP: ${ip || 'Inconnue'}`).catch(console.error)
        return { success: false, error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." }
    }

    try {
        const validatedData = LoginSchema.parse({ email, password })

        // Rechercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (!user) {
            sendTelegramMessage(`⚠️ *Tentative de connexion échouée*\nEmail inconnu: ${validatedData.email}\n🌐 IP: ${ip || 'Inconnue'}`).catch(console.error)
            return {
                success: false,
                error: 'Email ou mot de passe incorrect',
            }
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

        if (!isPasswordValid) {
            sendTelegramMessage(`⚠️ *Tentative de connexion échouée*\nMot de passe incorrect pour: ${validatedData.email}\n🌐 IP: ${ip || 'Inconnue'}`).catch(console.error)
            return {
                success: false,
                error: 'Email ou mot de passe incorrect',
            }
        }

        // Sécurisation OWASP: Token signé avec HMAC
        const timestamp = Date.now().toString()
        const payload = `${user.id}:${timestamp}`
        // OWASP: JWT_SECRET obligatoire en production
        if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
            console.error('[SECURITY] JWT_SECRET manquant en production !')
            return { success: false, error: 'Erreur de configuration serveur.' }
        }
        const secret = process.env.JWT_SECRET || 'default_secure_secret_for_riwaya'
        
        let signature = ''
        if (typeof crypto !== 'undefined' && crypto.createHmac) {
            signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
        }
        
        const token = Buffer.from(`${payload}:${signature}`).toString('base64')

        const isProd = process.env.NODE_ENV === 'production'
        
        const cookieStore = await cookies()
        cookieStore.set('admin-token', token, {
            httpOnly: true,
            secure: false, // Forcer à false pour permettre l'accès admin via IP/HTTP
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 jours
            path: '/',
        })

        // Stocker l'email pour l'audit (non sensible)
        cookieStore.set('admin-email', user.email, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        // Stocker le rôle pour le middleware
        cookieStore.set('admin-role', user.role, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        await createAuditLog({
            action: 'LOGIN',
            entity: 'AUTH',
            details: `Connexion réussie: ${user.email}`
        })

        if (user.role !== 'INFLUENCER') {
            try {
                await sendTelegramMessage(
                    `🔐 *Nouvelle Connexion Admin*\n\n` +
                    `👤 *Utilisateur:* ${user.email}\n` +
                    `🕒 *Date:* ${new Date().toLocaleString('fr-FR')}\n` +
                    `🌐 *IP:* ${ip || 'Inconnue'}`
                )
            } catch (e) {
                console.error('Erreur notification Telegram admin login:', e)
            }
        }

        return {
            success: true,
            redirect: user.role === 'INFLUENCER' ? '/influencer' : '/admin',
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
        // Décodage du token (format base64(userId:timestamp:signature))
        const decoded = Buffer.from(token, 'base64').toString('ascii')
        const [userId, timestamp, signature] = decoded.split(':')

        if (!userId || !timestamp) return false

        // Vérification de la signature HMAC
        const payload = `${userId}:${timestamp}`
        const secret = process.env.JWT_SECRET || 'default_secure_secret_for_riwaya'
        // OWASP: avertir si secret par défaut utilisé en production
        if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
            console.error('[SECURITY] JWT_SECRET manquant — token verification compromise!')
            return false
        }
        if (typeof crypto !== 'undefined' && crypto.createHmac) {
            const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
            if (!signature || signature !== expectedSignature) {

                return false
            }
        }

        // Vérifier si le token a moins de 7 jours (sécurité supplémentaire)
        const tokenTime = parseInt(timestamp)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        
        const isValid = (Date.now() - tokenTime <= sevenDays)

        
        if (!isValid) return false

        return true
    } catch (e) {
        console.error(`[DEBUG] isAuthenticated error:`, e)
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
        const [userId, timestamp, signature] = decoded.split(':')
        
        // Vérification HMAC Optionnelle ici
        return userId
    } catch {
        return null
    }
}

