'use client'

import { seedDatabase } from '@/lib/actions/seed'
import { useState } from 'react'

export default function SeedPage() {
    const [status, setStatus] = useState('Ready')
    const [counts, setCounts] = useState<{ books: number; packs: number } | null>(null)

    const fetchCounts = async () => {
        // On peut créer une action simple pour ça ou utiliser une API locale si on veut
        // Mais pour faire simple, on va juste rafraîchir après le bouton
    }

    const handleSeed = async () => {
        setStatus('Seeding...')
        try {
            const result = await seedDatabase()
            if (result.success) {
                setStatus('Success! ' + result.message)
                window.location.reload() // Rafraîchir pour voir les changements
            } else {
                setStatus('Error: ' + result.error)
            }
        } catch (e) {
            setStatus('Error: ' + String(e))
        }
    }

    return (
        <div className="p-12">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <button
                onClick={handleSeed}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Run Seed
            </button>
            <pre className="mt-4 p-4 bg-gray-100 rounded">{status}</pre>
        </div>
    )
}
