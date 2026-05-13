'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCustomer(data: { fullName: string, phone: string, email?: string, city?: string, address?: string }) {
    try {
        await prisma.customer.create({
            data: {
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                city: data.city,
                address: data.address
            }
        })

        revalidatePath('/[locale]/admin/customers', 'page')
        return { success: true }
    } catch (error: any) {
        console.error('Error creating customer:', error)
        if (error.code === 'P2002') {
            return { success: false, error: 'Ce numéro de téléphone est déjà utilisé' }
        }
        return { success: false, error: 'Erreur lors de la création' }
    }
}

export async function updateCustomer(id: string, data: { fullName: string, phone: string, email?: string, city?: string, address?: string }) {
    try {
        await prisma.customer.update({
            where: { id },
            data: {
                fullName: data.fullName,
                phone: data.phone,
                email: data.email,
                city: data.city,
                address: data.address
            }
        })

        // On met aussi à jour les commandes liées si le téléphone a changé
        // Mais avec la relation, c'est mieux de garder le customerId
        
        revalidatePath('/[locale]/admin/customers', 'page')
        return { success: true }
    } catch (error) {
        console.error('Error updating customer:', error)
        return { success: false, error: 'Erreur lors de la mise à jour' }
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({
            where: { id }
        })

        revalidatePath('/[locale]/admin/customers', 'page')
        return { success: true }
    } catch (error) {
        console.error('Error deleting customer:', error)
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}
