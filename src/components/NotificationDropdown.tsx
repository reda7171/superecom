'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    read: boolean
    createdAt: Date
}

interface NotificationDropdownProps {
    initialNotifications: Notification[]
    unreadCount: number
}

export default function NotificationDropdown({ initialNotifications, unreadCount: initialUnreadCount }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState(initialNotifications)
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('Community.Notifications')
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    async function markAsRead(notificationId: string) {
        try {
            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            })

            if (response.ok) {
                setNotifications(prev => prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                ))
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    async function markAllAsRead() {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST'
            })

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                setUnreadCount(0)
            }
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    async function deleteNotification(notificationId: string) {
        try {
            const response = await fetch('/api/notifications/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            })

            if (response.ok) {
                const wasUnread = notifications.find(n => n.id === notificationId)?.read === false
                setNotifications(prev => prev.filter(n => n.id !== notificationId))
                if (wasUnread) {
                    setUnreadCount(prev => Math.max(0, prev - 1))
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.read) {
            markAsRead(notification.id)
        }
        if (notification.link) {
            setIsOpen(false)
            router.push(notification.link)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'EXCHANGE_REQUEST': return '📩'
            case 'EXCHANGE_ACCEPTED': return '✅'
            case 'EXCHANGE_REJECTED': return '❌'
            case 'NEW_MESSAGE': return '💬'
            case 'EXCHANGE_COMPLETED': return '🎉'
            case 'RATING_RECEIVED': return '⭐'
            default: return '🔔'
        }
    }


    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors group"
            >
                <Bell className="w-6 h-6 text-gray-900 group-hover:text-black" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed left-4 right-4 top-24 w-auto md:absolute md:right-0 md:left-auto md:top-full md:w-96 md:mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-lg text-black">{t('Title')}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <Check className="w-4 h-4" />
                                {t('MarkAllRead')}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-gray-400">{t('Empty')}</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group ${!notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className="text-2xl shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div
                                            className="flex-grow min-w-0 cursor-pointer"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-bold text-sm text-black">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(notification.createdAt).toLocaleDateString(locale, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteNotification(notification.id)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                            <Link
                                href="/community/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 block text-center"
                            >
                                {t('All')} →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
