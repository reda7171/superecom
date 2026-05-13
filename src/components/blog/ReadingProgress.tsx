'use client'

import { useEffect, useState } from 'react'

// Barre de progression de lecture en haut de page
export default function ReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const onScroll = () => {
            const article = document.getElementById('article-content')
            if (!article) return

            const articleTop = article.getBoundingClientRect().top + window.scrollY
            const articleHeight = article.offsetHeight
            const scrolled = window.scrollY - articleTop
            const pct = Math.min(100, Math.max(0, (scrolled / articleHeight) * 100))
            setProgress(pct)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-gray-100">
            <div
                className="h-full bg-amber-400 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
