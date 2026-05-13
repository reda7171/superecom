'use client'

import { Truck } from 'lucide-react'

interface AnnouncementBarProps {
    message: string
    isEnabled?: boolean
    bgColor?: string
    textColor?: string
}

export default function AnnouncementBar({ 
    message, 
    isEnabled = true, 
    bgColor = "#000000", 
    textColor = "#FFFFFF" 
}: AnnouncementBarProps) {
    if (!isEnabled || !message) return null

    return (
        <div 
            className="py-3 overflow-hidden relative group" 
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <div className="flex whitespace-nowrap animate-marquee group-hover:pause-animation">
                {/* On répète le message plusieurs fois pour assurer un défilement continu */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-8 px-10">
                        <Truck className="w-4 h-4" style={{ color: bgColor === '#000000' ? '#FFD700' : textColor }} />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">
                            {message}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bgColor === '#000000' ? '#FFD700' : textColor, opacity: 0.5 }} />
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 50s linear infinite; /* Ralenti de 30s à 50s */
                }
                .pause-animation {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    )
}
