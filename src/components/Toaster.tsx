'use client'

import { useUIStore } from '@/store/ui'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Toaster() {
    const { notification, hideNotification } = useUIStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !notification) return null

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    }

    const bgColors = {
        success: 'bg-green-50 border-green-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-blue-50 border-blue-100'
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] border shadow-2xl backdrop-blur-md ${bgColors[notification.type]} min-w-[300px]`}>
                <div className="flex-shrink-0">
                    {icons[notification.type]}
                </div>
                <div className="flex-grow">
                    <p className="text-[11px] font-black uppercase tracking-widest text-black">
                        {notification.message}
                    </p>
                </div>
                <button
                    onClick={hideNotification}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    )
}
