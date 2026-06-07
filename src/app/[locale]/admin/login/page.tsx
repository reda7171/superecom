'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { login, checkApprovalStatus } from '@/lib/actions/auth'
import { Lock, Mail, Clock } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isWaitingApproval, setIsWaitingApproval] = useState(false)
    const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)

    useEffect(() => {
        let eventSource: EventSource

        if (isWaitingApproval && pendingRequestId) {
            eventSource = new EventSource(`/api/auth/stream?requestId=${pendingRequestId}`)

            eventSource.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data)
                    
                    if (data.status === 'APPROVED' || data.status === 'REJECTED') {
                        eventSource.close()
                        // Appel final à checkApprovalStatus pour valider et créer les cookies
                        const result = await checkApprovalStatus(pendingRequestId)
                        
                        if (result.success && 'redirect' in result) {
                            const from = searchParams.get('from') || result.redirect
                            router.push(from)
                            router.refresh()
                        } else if (!result.success && !('pending' in result && result.pending)) {
                            setIsWaitingApproval(false)
                            setPendingRequestId(null)
                            setError(result.error || 'Erreur lors de la validation')
                            setLoading(false)
                        }
                    }
                } catch (error) {
                    console.error("Erreur parsing SSE", error)
                }
            }

            eventSource.onerror = () => {
                eventSource.close()
            }
        }

        return () => {
            if (eventSource) {
                eventSource.close()
            }
        }
    }, [isWaitingApproval, pendingRequestId, router, searchParams])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await login(email, password)

        if (result.success) {
            if ('pendingApproval' in result && result.pendingApproval) {
                setPendingRequestId(result.requestId)
                setIsWaitingApproval(true)
            } else if ('redirect' in result) {
                const from = searchParams.get('from') || result.redirect
                router.push(from)
                router.refresh()
            }
        } else {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SuperEcom Admin</h1>
                        <p className="text-sm text-gray-600 mt-2">Connectez-vous à votre espace admin</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Form or Waiting state */}
                    {isWaitingApproval ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 animate-pulse">
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">En attente d'approbation</h2>
                            <p className="text-gray-600">Veuillez patienter, attendez l'approbation du super admin via Telegram.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@superEcom.store"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </form>
                    )}

                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    © 2026 SuperEcom. Tous droits réservés.
                </p>
            </div>
        </div>
    )
}
