'use client'

import { deletePost } from '@/lib/actions/blog'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTransition } from 'react'

export default function DeletePostButton({ id }: { id: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

        startTransition(async () => {
            await deletePost(id)
            router.refresh()
        })
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
            <Trash className="w-4 h-4" />
        </button>
    )
}
