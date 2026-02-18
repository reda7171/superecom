import { redirect } from 'next/navigation'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { getUserNotifications } from '@/lib/actions/community-notifications'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { Bell, Trash2, CheckCircle, MessageSquare, Repeat, Star, XCircle, Info } from 'lucide-react'
import Link from 'next/link'
import DeleteNotificationButton from '@/components/community/DeleteNotificationButton'
import MarkAllReadButton from '@/components/community/MarkAllReadButton'
import NotificationLink from '@/components/community/NotificationLink'

export default async function NotificationsPage() {
    const user = await getCommunityUser()

    if (!user) {
        redirect('/community/login')
    }

    const notifications = await getUserNotifications()

    const getIcon = (type: string) => {
        switch (type) {
            case 'EXCHANGE_REQUEST': return <Repeat className="w-6 h-6 text-blue-500" />
            case 'EXCHANGE_ACCEPTED': return <CheckCircle className="w-6 h-6 text-green-500" />
            case 'EXCHANGE_REJECTED': return <XCircle className="w-6 h-6 text-red-500" />
            case 'NEW_MESSAGE': return <MessageSquare className="w-6 h-6 text-purple-500" />
            case 'EXCHANGE_COMPLETED': return <Star className="w-6 h-6 text-yellow-500" />
            case 'RATING_RECEIVED': return <Star className="w-6 h-6 text-yellow-500" />
            default: return <Info className="w-6 h-6 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tighter mb-4 uppercase">
                            Notifications
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Restez informé de vos échanges et messages.
                        </p>
                    </div>
                    {notifications && notifications.length > 0 && (
                        <MarkAllReadButton />
                    )}
                </div>

                {!notifications || notifications.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-black mb-2">Tout est calme ici</h2>
                        <p className="text-gray-400 font-medium">
                            Vous n'avez pas encore de notifications.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-3xl p-6 border transition-all ${notification.read ? 'border-gray-100 opacity-75' : 'border-black shadow-md'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className="shrink-0 pt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="font-black text-black text-lg">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-xs font-bold text-gray-400">
                                                    {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <span className="shrink-0 w-3 h-3 bg-black rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 font-medium mb-4">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            {notification.link && (
                                                <NotificationLink
                                                    notificationId={notification.id}
                                                    link={notification.link}
                                                    read={notification.read}
                                                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                                                >
                                                    Voir les détails
                                                </NotificationLink>
                                            )}
                                            <DeleteNotificationButton notificationId={notification.id} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
