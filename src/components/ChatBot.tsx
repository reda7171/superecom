'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { 
    MessageCircle, X, Send, Bot, User, Loader2, 
    ThumbsUp, ThumbsDown, Sparkles, Volume2, VolumeX, 
    ChevronRight, CornerDownRight, Zap 
} from 'lucide-react'
import ProductCarousel from './chatbot/ProductCarousel'
import OrderCard from './chatbot/OrderCard'

interface Message {
    role: 'bot' | 'user'
    text: string
    time: string
    type?: 'products' | 'order'
    data?: any
    feedback?: 'up' | 'down' | null
}

export default function ChatBot() {
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'fr'
    
    // Translatable labels
    const labels: Record<string, any> = {
        ar: {
            welcome: "مرحباً! ✨ أنا المساعد الذكي لـ **رواية**. اسألني عن الكتب، الطلبات أو التوصيل.",
            quick: ['التوصيل ؟', 'الكتب الجديدة', 'مفتاح USB', 'تتبع الطلب', 'اقترح عناوين؟', 'التصنيفات ؟'],
            placeholder: "اسأل سؤالك هنا...",
            online: "متصل",
            viewBook: "عرض الكتاب",
            addToCart: "التفاصيل",
            trackOrder: "تتبع الطلب",
            estimated: "التسليم المتوقع",
            suggestions: "اقتراحات لك"
        },
        fr: {
            welcome: "Bonjour ! ✨ Je suis l'assistant intelligent de **SuperEcom**. Posez-moi vos questions sur nos livres, commandes ou livraison.",
            quick: ['Livraison ?', 'Nouveautés', 'Clé USB', 'Suivi Commande', 'Propose moi des titres?', 'Catégories ?'],
            placeholder: "Posez votre question...",
            online: "En ligne",
            viewBook: "Voir le livre",
            addToCart: "Détails",
            trackOrder: "Détails commande",
            estimated: "Livraison prévue",
            suggestions: "Suggestions pour vous"
        }
    }
    const t = labels[locale] || labels.fr

    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [unread, setUnread] = useState(0)
    const [sound, setSound] = useState(true)
    const [showSuggestions, setShowSuggestions] = useState(true)

    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const playPop = () => {
        if (!sound) return
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
        audio.volume = 0.1
        audio.play().catch(() => {})
    }

    useEffect(() => {
        if (messages.length === 0) {
            const timer = setTimeout(() => {
                const welcomeMsg: Message = {
                    role: 'bot',
                    text: t.welcome,
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }
                setMessages([welcomeMsg])
                
                // Auto-open logic
                const hasOpened = sessionStorage.getItem('bot_auto_opened')
                if (!hasOpened && !pathname?.includes('/admin')) {
                    setTimeout(() => {
                        setUnread(1)
                        sessionStorage.setItem('bot_auto_opened', 'true')
                        playPop()
                    }, 5000)
                }
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [locale, t.welcome])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    useEffect(() => {
        setMounted(true)
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 150)
            setUnread(0)
        }
    }, [open])

    if (!mounted || pathname?.includes('/admin')) return null

    const handleFeedback = (index: number, type: 'up' | 'down') => {
        setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, feedback: type } : msg))
    }

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return

        const userMsg: Message = {
            role: 'user',
            text: text.trim(),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        setShowSuggestions(false)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text.trim(), locale })
            })
            const data = await res.json()

            // Artificial delay for realism
            await new Promise(r => setTimeout(r, Math.min(Math.max(600, (data.reply?.length || 0) * 8), 1500)))

            const botMsg: Message = {
                role: 'bot',
                text: data.reply || "...",
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                type: data.type,
                data: data.data,
                feedback: null
            }

            setMessages(prev => [...prev, botMsg])
            playPop()
            if (!open) setUnread(prev => prev + 1)
            setShowSuggestions(true)
        } catch {
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "Erreur de connexion. Réessayez.",
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }])
        } finally {
            setLoading(false)
        }
    }

    const formatText = (text: string): React.ReactNode => {
        if (!text) return null
        const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|•[^\n]+|https?:\/\/[^\s]+)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-black text-gray-900">{part.slice(2, -2)}</strong>
            if (part.startsWith('[')) {
                const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
                if (match) return <a key={i} href={match[2]} className="text-blue-600 hover:text-blue-700 underline font-black">{formatText(match[1])}</a>
            }
            if (part.startsWith('•')) return <div key={i} className="flex gap-2 ml-1 my-1"><CornerDownRight className="w-3.5 h-3.5 mt-1 text-orange-500 flex-shrink-0" /><span className="text-gray-700">{formatText(part.slice(1).trim())}</span></div>
            if (part.startsWith('http')) return <a key={i} href={part} target="_blank" className="text-blue-600 hover:text-blue-700 underline font-bold">{part}</a>
            return part
        })
    }

    return (
        <>
            {/* Launcher Button */}
            <button 
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 left-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl z-50 group border border-white/20 touch-none active:scale-90 ${open ? 'scale-0' : 'scale-100'}`}
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #3e3e5e 100%)' }}
                aria-label="Ouvrir l'assistant"
            >
                <MessageCircle className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                {unread > 0 && <span className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center animate-bounce shadow-lg border-2 border-white">{unread}</span>}
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Chat Window */}
            {open && (
                <div 
                    className="fixed bottom-6 left-6 w-[380px] max-w-[90vw] h-[600px] max-h-[80vh] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col z-[100] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-500"
                >
                    {/* Premium Header */}
                    <div 
                        className="p-6 pb-8 flex items-center justify-between gap-4 relative"
                        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #3e3e5e 100%)' }}
                    >
                        <div className="relative group">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
                                <Bot className="w-7 h-7 text-white" />
                            </div>
                            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-black text-sm tracking-wide">Assistant SuperEcom</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                <span className="text-[10px] text-green-300 font-bold uppercase tracking-widest">{t.online}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setSound(!sound)}>
                                {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setOpen(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Decorative Wave */}
                        <div className="absolute bottom-0 left-0 w-full h-4 bg-white rounded-t-[2.5rem]" />
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll bg-white">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-[#FF6B6B] text-white'}`}>
                                    {msg.role === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                                    <div
                                        className={`px-4 py-3.5 rounded-2xl text-[13px] whitespace-pre-line leading-relaxed shadow-sm hover:shadow-md transition-all ${
                                            msg.role === 'bot'
                                                ? 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                                                : 'text-white rounded-tr-none font-medium'
                                        }`}
                                        style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' } : {}}
                                    >
                                        {formatText(msg.text)}

                                        {/* Dynamic Components */}
                                        {msg.role === 'bot' && msg.type === 'products' && <ProductCarousel products={msg.data} t={t} />}
                                        {msg.role === 'bot' && msg.type === 'order' && <OrderCard order={msg.data} t={t} />}
                                    </div>
                                    <div className={`flex items-center gap-3 px-1.5 opacity-60 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">{msg.time}</span>
                                        {msg.role === 'bot' && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleFeedback(i, 'up')} className={`hover:scale-125 transition-transform ${msg.feedback === 'up' ? 'text-green-500' : 'text-gray-300'}`}><ThumbsUp className="w-3 h-3" /></button>
                                                <button onClick={() => handleFeedback(i, 'down')} className={`hover:scale-125 transition-transform ${msg.feedback === 'down' ? 'text-red-500' : 'text-gray-300'}`}><ThumbsDown className="w-3 h-3" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 animate-in fade-in duration-300">
                                <div className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center shadow-sm">
                                    <Bot className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-4" />
                    </div>

                    {/* Suggestions Chips */}
                    {showSuggestions && (
                        <div className="px-6 py-3 border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth bg-white">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 pr-2 border-r border-gray-100">
                                <Zap className="w-3.5 h-3.5" />
                            </div>
                            {t.quick.map((q: string) => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    disabled={loading}
                                    className="whitespace-nowrap text-[11px] px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all font-black disabled:opacity-40"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Premium Input Bar */}
                    <div className="p-6 bg-white border-t border-gray-100 flex gap-3 items-center">
                        <div className="flex-1 relative group">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                                placeholder={t.placeholder}
                                maxLength={200}
                                disabled={loading}
                                className="w-full text-sm pl-5 pr-5 py-4 rounded-[1.5rem] border border-gray-100 bg-gray-50 focus:bg-white focus:border-gray-900 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition-all disabled:opacity-50 ring-0"
                            />
                        </div>
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || loading}
                            className="w-14 h-14 rounded-2xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 shadow-xl shadow-gray-200/50"
                            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #3e3e5e 100%)' }}
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
