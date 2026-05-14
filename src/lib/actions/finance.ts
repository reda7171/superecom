'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/actions/auth'
import { ExpenseCategory } from '@prisma/client'

export async function createExpense(data: {
    title: string
    amount: number
    category: ExpenseCategory
    description?: string
    unitCost?: number
}) {
    await verifyAdmin()
    try {
        await prisma.expense.create({
            data: {
                ...data,
                date: new Date()
            }
        })
        revalidatePath('/admin/finance')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Erreur lors de la création' }
    }
}

export async function updateExpense(id: string, data: {
    title: string
    amount: number
    category: ExpenseCategory
    description?: string
    unitCost?: number | null
}) {
    await verifyAdmin()
    try {
        await prisma.expense.update({
            where: { id },
            data
        })
        revalidatePath('/admin/finance')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Erreur lors de la modification' }
    }
}

export async function deleteExpense(id: string) {
    await verifyAdmin()
    try {
        await prisma.expense.delete({ where: { id } })
        revalidatePath('/admin/finance')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur suppression' }
    }
}

export async function getPurchaseLots() {
    await verifyAdmin()
    return prisma.expense.findMany({
        where: { 
            category: 'BOOKS_PURCHASE'
        },
        orderBy: { date: 'desc' }
    })
}

export async function getExpenses() {
    await verifyAdmin()
    return prisma.expense.findMany({
        orderBy: { date: 'desc' }
    })
}

export async function getFinancialStats() {
    await verifyAdmin()

    // Total Expenses
    const totalExpenses = await prisma.expense.aggregate({
        _sum: { amount: true }
    })

    // Expenses by Category
    const byCategory = await prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true }
    })

    // Commands (Chiffre d'affaire) and Cost (Pour Marge)
    const orders = await prisma.order.findMany({
        where: { status: 'DELIVERED' },
        include: {
            items: {
                include: {
                    book: { select: { costPrice: true } },
                    pack: { select: { costPrice: true } }
                }
            }
        }
    })

    let totalRevenue = 0
    let totalCostOfGoodsSold = 0
    let totalFixedCosts = 0

    for (const order of orders) {
        totalRevenue += order.total
        totalFixedCosts += 2.65 + (order.shippingFees || 0)
        for (const item of order.items) {
            // Utiliser le costPrice de l'item ou celui du produit s'il est à 0
            const itemCost = ((item as any).costPrice && (item as any).costPrice > 0)
                ? (item as any).costPrice
                : ((item as any).book?.costPrice || (item as any).pack?.costPrice || 0)
            totalCostOfGoodsSold += itemCost * item.quantity
        }
    }

    return {
        totalExpenses: totalExpenses._sum.amount || 0,
        totalRevenue: totalRevenue,
        totalCostOfGoodsSold: totalCostOfGoodsSold + totalFixedCosts, // On inclut dans le coût total de vente
        byCategory: byCategory.map(c => ({
            category: c.category,
            amount: c._sum.amount || 0
        }))
    }
}
