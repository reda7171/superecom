'use client'

import React from 'react'
import { Link } from '@/i18n/routing'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-xs font-medium text-gray-500">
                <li className="flex items-center">
                    <Link href="/" className="hover:text-black transition-colors flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        <span className="hidden sm:inline">Accueil</span>
                    </Link>
                </li>
                
                {items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                        {item.href ? (
                            <Link 
                                href={item.href as any} 
                                className="hover:text-black transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-black font-bold truncate max-w-[150px] sm:max-w-xs" aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>

            {/* JSON-LD for Breadcrumbs */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        'itemListElement': [
                            {
                                '@type': 'ListItem',
                                'position': 1,
                                'name': 'Accueil',
                                'item': process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.store'
                            },
                            ...items.map((item, index) => ({
                                '@type': 'ListItem',
                                'position': index + 2,
                                'name': item.label,
                                'item': item.href ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://riwaya.store'}${item.href}` : undefined
                            }))
                        ]
                    })
                }}
            />
        </nav>
    )
}
