'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminExchange, getEligibleUsers, getUserExchangeBooks } from '@/lib/actions/admin-exchanges'
import { User, Book, Check, AlertCircle, Loader2 } from 'lucide-react'

export default function CreateExchangeForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])

    // Form state
    const [requesterId, setRequesterId] = useState('')
    const [responderId, setResponderId] = useState('')
    const [bookRequestedId, setBookRequestedId] = useState('')
    const [bookOfferedId, setBookOfferedId] = useState('')
    const [type, setType] = useState<'DIRECT' | 'CREDIT'>('DIRECT')
    const [creditsAmount, setCreditsAmount] = useState(0)
    const [message, setMessage] = useState('')

    // Data for dropdowns
    const [requesterBooks, setRequesterBooks] = useState<any[]>([])
    const [responderBooks, setResponderBooks] = useState<any[]>([])

    useEffect(() => {
        getEligibleUsers().then(setUsers)
    }, [])

    useEffect(() => {
        if (requesterId) {
            getUserExchangeBooks(requesterId).then(setRequesterBooks)
        } else {
            setRequesterBooks([])
        }
    }, [requesterId])

    useEffect(() => {
        if (responderId) {
            getUserExchangeBooks(responderId).then(setResponderBooks)
        } else {
            setResponderBooks([])
        }
    }, [responderId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!requesterId || !responderId || !bookRequestedId) {
            alert('Veuillez remplir les champs obligatoires')
            return
        }

        setLoading(true)
        const result = await createAdminExchange({
            requesterId,
            responderId,
            bookRequestedId,
            bookOfferedId: type === 'DIRECT' ? bookOfferedId : undefined,
            type,
            creditsAmount: type === 'CREDIT' ? creditsAmount : undefined,
            message
        })

        if (result.success) {
            router.push('/fr/admin/exchanges')
            router.refresh()
        } else {
            alert(result.error)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Demandeur */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="font-black text-sm uppercase tracking-wider text-gray-900">Demandeur (Requester)</h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Utilisateur</label>
                        <select
                            value={requesterId}
                            onChange={(e) => setRequesterId(e.target.value)}
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                            required
                        >
                            <option value="">Sélectionner un utilisateur</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    {type === 'DIRECT' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Livre à proposer (Offered)</label>
                            <select
                                value={bookOfferedId}
                                onChange={(e) => setBookOfferedId(e.target.value)}
                                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                                required={type === 'DIRECT'}
                                disabled={!requesterId}
                            >
                                <option value="">---</option>
                                {requesterBooks.map(b => (
                                    <option key={b.id} value={b.id}>{b.title}</option>
                                ))}
                            </select>
                            {!requesterId && <p className="text-[10px] text-gray-400 mt-1">Sélectionnez d'abord un demandeur</p>}
                            {requesterId && requesterBooks.length === 0 && <p className="text-[10px] text-orange-500 mt-1">Aucun livre disponible pour cet utilisateur</p>}
                        </div>
                    )}

                    {type === 'CREDIT' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Montant crédits</label>
                            <input
                                type="number"
                                value={creditsAmount}
                                onChange={(e) => setCreditsAmount(parseInt(e.target.value))}
                                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                                min="0"
                            />
                        </div>
                    )}
                </div>

                {/* Receveur */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                        </div>
                        <h2 className="font-black text-sm uppercase tracking-wider text-gray-900">Receveur (Owner)</h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Propriétaire</label>
                        <select
                            value={responderId}
                            onChange={(e) => setResponderId(e.target.value)}
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                            required
                        >
                            <option value="">Sélectionner un utilisateur</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id} disabled={u.id === requesterId}>{u.fullName} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Livre demandé</label>
                        <select
                            value={bookRequestedId}
                            onChange={(e) => setBookRequestedId(e.target.value)}
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                            required
                            disabled={!responderId}
                        >
                            <option value="">---</option>
                            {responderBooks.map(b => (
                                <option key={b.id} value={b.id}>{b.title}</option>
                            ))}
                        </select>
                        {!responderId && <p className="text-[10px] text-gray-400 mt-1">Sélectionnez d'abord un propriétaire</p>}
                    </div>
                </div>
            </div>

            {/* Type & Message */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Type d'échange</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setType('DIRECT')}
                            className={`flex-1 py-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${type === 'DIRECT' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            Échange Direct (Livre contre Livre)
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('CREDIT')}
                            className={`flex-1 py-4 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${type === 'CREDIT' ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            Échange contre Crédits
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message (optionnel)</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all min-h-[100px]"
                        placeholder="Ex: Échange organisé manuellement par l'admin..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-black transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Créer l'échange
                </button>
            </div>
        </form>
    )
}
