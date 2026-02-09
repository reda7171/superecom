'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { markMessagesAsRead } from '@/lib/actions/community-chat'

interface Message {
    id: string
    content: string
    createdAt: Date
    read: boolean
    sender: {
        id: string
        fullName: string | null
        image: string | null
    }
}

interface ChatMessagesProps {
    messages: Message[]
    chatId: string
    userId: string
}

export default function ChatMessages({ messages, chatId, userId }: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const t = useTranslations('Community.Chat')

    // Auto-scroll vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Marquer comme lu au chargement
    useEffect(() => {
        markMessagesAsRead(chatId)
    }, [chatId])

    if (messages.length === 0) {
        return (
            <div className="flex-grow flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-lg font-black text-gray-400">{t('Empty')}</p>
                    <p className="text-sm text-gray-400 mt-2">{t('StartConversation')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => {
                const isCurrentUser = message.sender.id === userId
                const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id

                return (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        {showAvatar ? (
                            message.sender.image ? (
                                <img
                                    src={message.sender.image}
                                    alt={message.sender.fullName || ''}
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-black text-gray-600">
                                        {message.sender.fullName?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )
                        ) : (
                            <div className="w-10 shrink-0"></div>
                        )}

                        {/* Message Bubble */}
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                            {showAvatar && (
                                <span className="text-[10px] font-black text-gray-400 mb-1 px-2 uppercase tracking-widest">
                                    {message.sender.fullName || 'User'}
                                </span>
                            )}
                            <div
                                className={`px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md ${isCurrentUser
                                    ? 'bg-black text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-100 text-black rounded-tl-sm'
                                    }`}
                            >
                                <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                                    {message.content}
                                </p>
                            </div>
                            <div className={`flex items-center gap-2 mt-1 px-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className="text-[10px] font-bold text-gray-400">
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                {isCurrentUser && message.read && (
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{t('Read')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}
