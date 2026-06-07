import { redirect } from 'next/navigation'
import { getOrCreateChat } from '@/lib/actions/community-chat'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import ChatMessages from '@/components/community/ChatMessages'
import ChatInput from '@/components/community/ChatInput'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'

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
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header Chat */}
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/community/exchanges"
                                className="p-3 bg-gray-50 hover:bg-pixio-yellow rounded-2xl transition-all active:scale-95"
                            >
                                <ArrowLeft className="w-5 h-5 text-black" />
                            </Link>
                            <div className="flex-grow">
                                <h1 className="text-xl font-black text-black leading-tight">Chat d'échange</h1>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    {exchange.productRequested.title}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${exchange.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                exchange.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {exchange.status}
                            </span>
                        </div>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
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
            </main>

            <Footer />
        </div>
    )
}
