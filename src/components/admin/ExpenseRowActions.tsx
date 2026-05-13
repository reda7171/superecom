'use client'

import { Trash2 } from 'lucide-react'
import { deleteExpense } from '@/lib/actions/finance'
import { useState } from 'react'
import ExpenseForm from './ExpenseForm'

export default function ExpenseRowActions({ expense }: { expense: any }) {
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('Voulez-vous vraiment supprimer cette dépense ?')) return
        setIsDeleting(true)
        await deleteExpense(expense.id)
        setIsDeleting(false)
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <ExpenseForm expense={expense} />
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 bg-white rounded-lg border border-red-100 transition shadow-sm disabled:opacity-50"
                title="Supprimer"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    )
}
