'use client'

import { BookOpen } from 'lucide-react'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-pixio-cream">
            <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center relative">
                {/* Fallback Elegant Book Loader */}
                <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
                    <div className="relative">
                        <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl relative z-10 animate-bounce">
                            <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 blur-xl rounded-[100%]" />
                    </div>
                    <span className="text-3xl font-black text-black tracking-tighter">
                        riwaya<span className="text-pixio-yellow">.</span>
                    </span>
                </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 opacity-60">
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    )
}
