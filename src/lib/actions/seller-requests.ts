'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSellerRequest(data: {
    storeName: string
    managerName: string
    email: string
    phone: string
    city: string
    stockSize: string
}) {
    try {
        const request = await prisma.sellerRequest.create({
            data: {
                ...data,
                status: 'PENDING'
            }
        })
        
        revalidatePath('/admin/vendeurs')
        return { success: true, request }
    } catch (error) {
        console.error('Erreur createSellerRequest:', error)
        return { success: false, error: 'Une erreur est survenue lors de l\'envoi de la demande.' }
    }
}

export async function getSellerRequests() {
    try {
        const requests = await prisma.sellerRequest.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, requests }
    } catch (error) {
        console.error('Erreur getSellerRequests:', error)
        return { success: false, error: 'Impossible de récupérer les demandes.' }
    }
}

export async function updateSellerRequestStatus(id: string, status: string) {
    try {
        const updated = await prisma.sellerRequest.update({
            where: { id },
            data: { status }
        })

        // Si la demande est approuvée, on crée un compte SELLER
        if (status === 'APPROVED') {
            const bcrypt = require('bcryptjs')
            // Mot de passe par défaut : seller + 4 derniers caractères de l'ID ou phone
            const defaultPassword = 'Seller' + updated.phone.slice(-4)
            const hashedPassword = await bcrypt.hash(defaultPassword, 10)

            await prisma.user.upsert({
                where: { email: updated.email },
                update: {
                    role: 'SELLER',
                    fullName: updated.managerName,
                    phone: updated.phone,
                    city: updated.city
                },
                create: {
                    email: updated.email,
                    password: hashedPassword,
                    role: 'SELLER',
                    fullName: updated.managerName,
                    phone: updated.phone,
                    city: updated.city,
                    credits: 0 // Les vendeurs commencent avec 0 crédits d'échange
                }
            })
            
            // Note: En production, on enverrait un mail ici avec defaultPassword

        }

        revalidatePath('/admin/vendeurs')
        return { success: true, request: updated }
    } catch (error) {
        console.error('Erreur updateSellerRequestStatus:', error)
        return { success: false, error: 'Impossible de mettre à jour le statut.' }
    }
}

export async function deleteSellerRequest(id: string) {
    try {
        await prisma.sellerRequest.delete({
            where: { id }
        })
        revalidatePath('/admin/vendeurs')
        return { success: true }
    } catch (error) {
        console.error('Erreur deleteSellerRequest:', error)
        return { success: false, error: 'Impossible de supprimer la demande.' }
    }
}
