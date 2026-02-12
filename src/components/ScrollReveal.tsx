'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
    children: React.ReactNode
    className?: string
    animation?: 'animate-reveal-up' | 'animate-reveal-right'
    delay?: number
}

export default function ScrollReveal({
    children,
    className = "",
    animation = "animate-reveal-up",
    delay = 0
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        )

        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={elementRef}
            className={`${className} ${!isVisible ? 'reveal-hidden' : animation}`}
            style={{
                animationDelay: `${delay}ms`,
                animationFillMode: 'forwards'
            }}
        >
            {children}
        </div>
    )
}
