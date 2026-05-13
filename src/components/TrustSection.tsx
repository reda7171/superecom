'use client'

import { useTranslations } from 'next-intl'
import { BookCheck, Globe, Users2, Repeat } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useResponsiveAnimation } from '@/hooks/useResponsiveAnimation'

function AnimatedCounter({ value, duration = 2000 }: { value: string, duration?: number }) {
    const [count, setCount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLDivElement>(null)

    // Extraire le nombre et le suffixe (ex: "1500+" -> 1500, "+")
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''))
    const suffix = value.replace(/[0-9]/g, '')

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isVisible) return

        let start = 0
        const end = numericValue
        const range = end - start
        let current = start
        const increment = end > start ? 1 : -1
        const stepTime = Math.abs(Math.floor(duration / range))

        // Assurer un stepTime minimum pour la fluidité
        const timer = setInterval(() => {
            current += Math.ceil(range / (duration / 16)) // ~60fps
            if (current >= end) {
                setCount(end)
                clearInterval(timer)
            } else {
                setCount(current)
            }
        }, 16)

        return () => clearInterval(timer)
    }, [isVisible, numericValue, duration])

    return (
        <span ref={elementRef} className="tabular-nums">
            {count.toLocaleString()}{suffix}
        </span>
    )
}

interface StatCardProps {
    icon: React.ReactNode
    number: string
    label: string
    bgColor: string
    iconColor: string
    idx: number
}

function StatCard({ icon, number, label, bgColor, iconColor, idx }: StatCardProps) {
    return (
        <div
            className="group relative bg-white rounded-[3rem] p-12 flex flex-col items-center text-center shadow-2xl shadow-black/5 border border-gray-100/50 hover:border-pixio-yellow transition-all duration-700 hover:-translate-y-3"
            style={{ transitionDelay: `${idx * 100}ms` }}
        >
            {/* Decorative Background Glass */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>

            <div className={`relative w-24 h-24 ${bgColor} rounded-[2rem] flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform duration-500 shadow-xl`}>
                <div className={`${iconColor} scale-125`}>
                    {icon}
                </div>
            </div>

            <div className="relative space-y-3">
                <h3 className="text-6xl font-black text-black tracking-[-0.05em] leading-none mb-2 group-hover:scale-110 transition-transform duration-500">
                    <AnimatedCounter value={number} />
                </h3>
                <div className="w-10 h-1 bg-gray-100 mx-auto rounded-full group-hover:w-16 group-hover:bg-pixio-yellow transition-all duration-500"></div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] font-outfit">
                    {label}
                </p>
            </div>

            {/* Corner Decorative Element */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
                <Repeat className="w-12 h-12 text-black -rotate-12" />
            </div>
        </div>
    )
}

export default function TrustSection({ stats, className, style }: { stats?: { books: number, readers: number, exchanges: number }, className?: string, style?: React.CSSProperties }) {
    const t = useTranslations('HomePage.Trust')
    const pulseClass = useResponsiveAnimation('animate-pulse')
    const pingClass = useResponsiveAnimation('animate-ping')

    const statsData = [
        {
            icon: <BookCheck className="w-10 h-10" />,
            number: stats?.books ? `${stats.books}+` : "1500+",
            label: t('Items.Books'),
            bgColor: "bg-pixio-yellow/30",
            iconColor: "text-amber-600"
        },
        {
            icon: <Globe className="w-10 h-10" />,
            number: "50+",
            label: t('Items.Cities'),
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600"
        },
        {
            icon: <Users2 className="w-10 h-10" />,
            number: stats?.readers ? `${stats.readers}+` : "1200+",
            label: t('Items.Readers'),
            bgColor: "bg-rose-50",
            iconColor: "text-rose-500"
        },
        {
            icon: <Repeat className="w-10 h-10" />,
            number: stats?.exchanges ? `${stats.exchanges}+` : "300+",
            label: t('Items.Exchanges'),
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600"
        }
    ]

    return (
        <section className={`py-40 relative overflow-hidden ${className || 'bg-white'}`} style={style}>
            {/* Master Background Elements */}
            <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-pixio-yellow/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 -z-10 ${pulseClass}`}></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with High-End Typography */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32 space-y-8">
                    <div className="inline-flex items-center gap-3 px-8 py-3 bg-black text-white rounded-full hover:scale-105 transition-transform cursor-default">
                        <div className={`w-2 h-2 bg-pixio-yellow rounded-full ${pingClass}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                            {t('Badge')}
                        </span>
                    </div>

                    <h2 className="text-6xl md:text-9xl font-black text-black tracking-[-0.07em] leading-[0.85] uppercase">
                        {t('Title')}<span className="text-pixio-yellow">.</span>
                    </h2>

                    <p className="text-2xl text-gray-400 font-medium tracking-tight max-w-2xl border-l-4 border-pixio-yellow pl-8 italic">
                        {t('Description')}
                    </p>
                </div>

                {/* Grid with Custom Spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {statsData.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            {...stat}
                            idx={idx}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
