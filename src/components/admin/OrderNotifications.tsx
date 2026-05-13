'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Bell, ShoppingCart, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface OrderNotif {
    id: string
    fullName: string
    total: number
    city: string
    status: string
    createdAt: string
}

export default function OrderNotifications() {
    const { locale } = useParams()
    const lang = typeof locale === 'string' ? locale : 'fr'
    const [notifications, setNotifications] = useState<OrderNotif[]>([])
    const [open, setOpen] = useState(false)
    const [unread, setUnread] = useState(0)
    const [connected, setConnected] = useState(false)
    const audioRef = useRef<AudioContext | null>(null)

    // Son de notification
    const playSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            oscillator.connect(gain)
            gain.connect(ctx.destination)
            oscillator.frequency.setValueAtTime(880, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
            gain.gain.setValueAtTime(0.3, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.5)
        } catch {}
    }, [])

    // Notification navigateur
    const sendBrowserNotif = useCallback((order: OrderNotif) => {
        if (typeof window === 'undefined' || !('Notification' in window)) return
        if (Notification.permission === 'granted') {
            new Notification('🛒 Nouvelle commande !', {
                body: `${order.fullName} — ${order.total} MAD — ${order.city}`,
                icon: '/favicon.ico'
            })
        }
    }, [])

    // SSE connexion
    useEffect(() => {
        // Demander permission notification navigateur (si disponible)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }

        let es: EventSource
        let reconnectTimer: ReturnType<typeof setTimeout>

        function connect() {
            es = new EventSource('/api/admin/notifications/stream')

            es.onopen = () => setConnected(true)
            es.onerror = () => {
                setConnected(false)
                es.close()
                // Reconnexion après 10s
                reconnectTimer = setTimeout(connect, 10000)
            }

            es.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data)
                    if (data.type === 'new_orders' && data.orders?.length > 0) {
                        setNotifications(prev => {
                            const existingIds = new Set(prev.map(n => n.id))
                            const fresh = data.orders.filter((o: OrderNotif) => !existingIds.has(o.id))
                            if (fresh.length === 0) return prev
                            fresh.forEach((o: OrderNotif) => sendBrowserNotif(o))
                            playSound()
                            setUnread(u => u + fresh.length)
                            return [...fresh, ...prev].slice(0, 20)
                        })
                    }
                } catch {}
            }
        }

        connect()
        return () => {
            es?.close()
            clearTimeout(reconnectTimer)
        }
    }, [playSound, sendBrowserNotif])

    const handleOpen = () => {
        setOpen(o => !o)
        setUnread(0)
    }

    const removeNotif = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <div className="relative">
            {/* Cloche */}
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Notifications commandes"
            >
                <Bell className={`w-5 h-5 ${unread > 0 ? 'text-orange-400 animate-[wiggle_0.5s_ease-in-out_infinite]' : 'text-white/70'}`} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
                {/* Indicateur connexion */}
                <span className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute -right-2 sm:right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-orange-400" />
                            <span className="text-white font-black text-sm">Nouvelles commandes</span>
                        </div>
                        <Link
                            href={`/${lang}/admin/orders`}
                            className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
                            onClick={() => setOpen(false)}
                        >
                            Voir tout <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Aucune nouvelle commande
                            </div>
                        ) : (
                            notifications.map(order => (
                                <div key={order.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <ShoppingCart className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 truncate">{order.fullName}</p>
                                        <p className="text-xs text-gray-500 font-medium">{order.city} — <span className="text-orange-600 font-black">{order.total} MAD</span></p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeNotif(order.id)}
                                        className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
