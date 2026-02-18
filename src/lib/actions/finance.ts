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

    // Total Revenue (from Orders)
    const totalRevenue = await prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true }
    })

    return {
        totalExpenses: totalExpenses._sum.amount || 0,
        totalRevenue: totalRevenue._sum.total || 0,
        byCategory: byCategory.map(c => ({
            category: c.category,
            amount: c._sum.amount || 0
        }))
    }
}
