'use client'

import { useRef, useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { importOrdersFromExcel } from '@/lib/actions/admin-import-orders'

export default function ImportOrdersButton() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await importOrdersFromExcel(formData)
            if (res.success) {
                setMessage({ type: 'success', text: `${res.count} commandes importées avec succès !` })
                setTimeout(() => setMessage(null), 5000)
            } else {
                setMessage({ type: 'error', text: `Erreur: ${res.error}` })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Une erreur est survenue lors de l\'import.' })
        } finally {
            setLoading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <>
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
            />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Importé commandes
            </button>

            {message && (
                <div className={`fixed bottom-5 right-5 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-5 z-50 ${message.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-200" />}
                    {message.text}
                </div>
            )}
        </>
    )
}
