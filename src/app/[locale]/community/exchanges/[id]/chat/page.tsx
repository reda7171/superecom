import { redirect } from 'next/navigation'
import { getOrCreateChat } from '@/lib/actions/community-chat'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import ChatMessages from '@/components/community/ChatMessages'
import ChatInput from '@/components/community/ChatInput'

export default async function ExchangeChatPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [chatResult, user] = await Promise.all([
        getOrCreateChat(id),
        getCommunityUser()
    ])

    if (!chatResult.success || !chatResult.chat || !user) {
        redirect('/community/exchanges')
    }

    const chat = chatResult.chat

    const exchange = chat.exchange

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/community/exchanges"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-grow">
                            <h1 className="text-2xl font-black text-black">Chat d'échange</h1>
                            <p className="text-sm text-gray-500 font-bold">
                                {exchange.bookRequested.title}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-xs font-black ${exchange.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            exchange.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {exchange.status}
                        </span>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
                    {/* Messages */}
                    <ChatMessages
                        messages={chat.messages}
                        chatId={chat.id}
                        userId={user.id}
                    />

                    {/* Input */}
                    <ChatInput chatId={chat.id} />
                </div>
            </div>
        </div>
    )
}
