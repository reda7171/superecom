'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { MOROCCO_CITIES } from '@/lib/constants/cities'

// Simple debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export default function MarketFiltersClient() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations('Community.Market')

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [city, setCity] = useState(searchParams.get('city') || '')

    // Debounce search input
    const debouncedSearch = useDebounce(search, 500)
    const debouncedCity = useDebounce(city, 500)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)

        if (debouncedSearch) {
            params.set('search', debouncedSearch)
        } else {
            params.delete('search')
        }

        if (debouncedCity) {
            params.set('city', debouncedCity)
        } else {
            params.delete('city')
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [debouncedSearch, debouncedCity, pathname, router, searchParams])

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={t('SearchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:border-black focus:ring-0 outline-none transition-all font-bold text-sm"
                />
            </div>
            <div className="w-full md:w-64 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:border-black focus:ring-0 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                >
                    <option value="">{t('AllCities')}</option>
                    {MOROCCO_CITIES.map((cityName) => (
                        <option key={cityName} value={cityName}>{cityName}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
