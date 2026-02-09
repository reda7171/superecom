'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { sendMessage } from '@/lib/actions/community-chat'
import { useRouter } from '@/i18n/routing'

interface ChatInputProps {
    chatId: string
}

export default function ChatInput({ chatId }: ChatInputProps) {
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    async function handleSend() {
        if (!message.trim() || sending) return

        setSending(true)
        const result = await sendMessage(chatId, message)

        if (result.success) {
            setMessage('')
            router.refresh()

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        } else {
            alert(result.error || 'Erreur lors de l\'envoi du message')
        }

        setSending(false)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    function handleInput() {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }

    return (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex items-end gap-3">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez votre message..."
                    disabled={sending}
                    rows={1}
                    className="flex-grow px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-black outline-none transition-all font-medium text-black resize-none max-h-32 disabled:opacity-50"
                    style={{ minHeight: '48px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-1">
                Appuyez sur <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-bold">Entrée</kbd> pour envoyer, <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-bold">Shift + Entrée</kbd> pour une nouvelle ligne
            </p>
        </div>
    )
}
