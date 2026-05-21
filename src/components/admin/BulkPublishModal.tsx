'use client'

import { useState, useRef } from 'react'
import { X, Play, Pause, CheckCircle, XCircle, Clock, Send, Loader2 } from 'lucide-react'

interface Book {
    id: string
    title: string
    author: string
    price: number
    image: string
    category: string | null
}

interface BulkPublishModalProps {
    books: Book[]
    isOpen: boolean
    onClose: () => void
}

type PublishStatus = 'pending' | 'running' | 'success' | 'error'

interface BookStatus {
    bookId: string
    status: PublishStatus
    message?: string
}

export default function BulkPublishModal({ books, isOpen, onClose }: BulkPublishModalProps) {
    const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'both'>('both')
    const [delaySeconds, setDelaySeconds] = useState(5)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [statuses, setStatuses] = useState<BookStatus[]>([])
    const [currentIndex, setCurrentIndex] = useState(-1)
    const pauseRef = useRef(false)
    const stopRef = useRef(false)

    if (!isOpen) return null

    const resetState = () => {
        setStatuses([])
        setCurrentIndex(-1)
        setIsRunning(false)
        setIsPaused(false)
        pauseRef.current = false
        stopRef.current = false
    }

    const updateStatus = (bookId: string, status: PublishStatus, message?: string) => {
        setStatuses(prev => {
            const exists = prev.find(s => s.bookId === bookId)
            if (exists) {
                return prev.map(s => s.bookId === bookId ? { ...s, status, message } : s)
            }
            return [...prev, { bookId, status, message }]
        })
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const handleStart = async () => {
        resetState()
        setIsRunning(true)
        stopRef.current = false
        pauseRef.current = false

        for (let i = 0; i < books.length; i++) {
            if (stopRef.current) break

            // Pause : attendre la reprise
            while (pauseRef.current) {
                await sleep(500)
            }

            const book = books[i]
            setCurrentIndex(i)
            updateStatus(book.id, 'running')

            try {
                const res = await fetch('/api/n8n/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookId: book.id,
                        format: 'post',
                        platform,
                        useDescription: 'short',
                        scheduleAt: null,
                    })
                })
                const data = await res.json()
                if (data.success) {
                    updateStatus(book.id, 'success', 'Publié avec succès')
                } else {
                    updateStatus(book.id, 'error', data.error || 'Erreur n8n')
                }
            } catch (err: any) {
                updateStatus(book.id, 'error', 'Erreur réseau')
            }

            // Délai entre chaque publication (sauf dernier)
            if (i < books.length - 1 && !stopRef.current) {
                await sleep(delaySeconds * 1000)
            }
        }

        setIsRunning(false)
        setCurrentIndex(-1)
    }

    const handlePause = () => {
        pauseRef.current = !pauseRef.current
        setIsPaused(pauseRef.current)
    }

    const handleStop = () => {
        stopRef.current = true
        pauseRef.current = false
        setIsPaused(false)
        setIsRunning(false)
        setCurrentIndex(-1)
    }

    const successCount = statuses.filter(s => s.status === 'success').length
    const errorCount = statuses.filter(s => s.status === 'error').length
    const isDone = !isRunning && statuses.length > 0

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Publication en boucle</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{books.length} livre(s) sélectionnés</p>
                    </div>
                    <button
                        onClick={() => { handleStop(); onClose() }}
                        className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Config */}
                {!isRunning && statuses.length === 0 && (
                    <div className="px-8 py-6 space-y-5 border-b border-gray-100">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Plateforme</label>
                            <div className="flex gap-2">
                                {(['facebook', 'instagram', 'both'] as const).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${platform === p ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {p === 'both' ? 'FB + Insta' : p === 'facebook' ? 'Facebook' : 'Instagram'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                Délai entre publications : <span className="text-black">{delaySeconds}s</span>
                            </label>
                            <input
                                type="range"
                                min={3}
                                max={60}
                                value={delaySeconds}
                                onChange={e => setDelaySeconds(Number(e.target.value))}
                                className="w-full accent-black"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>3s</span><span>60s</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {(isRunning || isDone) && (
                    <div className="px-8 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Progression</span>
                            <span className="text-xs font-black text-gray-900">{statuses.length}/{books.length}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-black h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(statuses.length / books.length) * 100}%` }}
                            />
                        </div>
                        {isDone && (
                            <div className="flex gap-4 mt-3">
                                <span className="text-xs font-bold text-green-600">{successCount} réussis</span>
                                {errorCount > 0 && <span className="text-xs font-bold text-red-500">{errorCount} erreurs</span>}
                            </div>
                        )}
                    </div>
                )}

                {/* Liste des livres */}
                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
                    {books.map((book, idx) => {
                        const status = statuses.find(s => s.bookId === book.id)
                        const isCurrent = currentIndex === idx

                        return (
                            <div
                                key={book.id}
                                className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isCurrent ? 'bg-black/5 ring-2 ring-black/10' : 'bg-gray-50'}`}
                            >
                                {/* Image */}
                                <img
                                    src={book.image || '/book-placeholder.png'}
                                    alt={book.title}
                                    className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/book-placeholder.png' }}
                                />
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{book.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                                </div>
                                {/* Statut */}
                                <div className="flex-shrink-0">
                                    {isCurrent && (
                                        <Loader2 className="w-5 h-5 text-black animate-spin" />
                                    )}
                                    {status?.status === 'success' && (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    {status?.status === 'error' && (
                                        <XCircle className="w-5 h-5 text-red-500" title={status.message} />
                                    )}
                                    {!status && !isCurrent && (
                                        <Clock className="w-4 h-4 text-gray-300" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer actions */}
                <div className="px-8 py-5 border-t border-gray-100 flex items-center gap-3">
                    {!isRunning && statuses.length === 0 && (
                        <button
                            onClick={handleStart}
                            className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all shadow-xl shadow-black/10 active:scale-95"
                        >
                            <Play className="w-4 h-4" />
                            Lancer la publication
                        </button>
                    )}
                    {isRunning && (
                        <>
                            <button
                                onClick={handlePause}
                                className="flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all"
                            >
                                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                {isPaused ? 'Reprendre' : 'Pause'}
                            </button>
                            <button
                                onClick={handleStop}
                                className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all"
                            >
                                <X className="w-4 h-4" />
                                Arrêter
                            </button>
                        </>
                    )}
                    {isDone && (
                        <button
                            onClick={() => { resetState(); onClose() }}
                            className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all"
                        >
                            <Send className="w-4 h-4" />
                            Terminé — Fermer
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
