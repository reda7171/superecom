'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { Search, MapPin, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams as useSearchParamsNext } from 'next/navigation'

export default function MarketSearch({ cities }: { cities: string[] }) {
    const t = useTranslations('Community.Market')
    const tbf = useTranslations('Community.BookForm')
    const searchParams = useSearchParamsNext()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = (formData: FormData) => {
        const params = new URLSearchParams(searchParams.toString())

        const search = formData.get('search') as string
        const city = formData.get('city') as string
        const condition = formData.get('condition') as string

        if (search) params.set('search', search)
        else params.delete('search')

        if (city) params.set('city', city)
        else params.delete('city')

        if (condition) params.set('condition', condition)
        else params.delete('condition')

        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <form action={handleSearch} className="bg-white rounded-[2rem] p-6 shadow-lg shadow-black/5 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                    name="search"
                    defaultValue={searchParams.get('search')?.toString()}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm"
                    placeholder={t('SearchPlaceholder')}
                />
            </div>

            {/* City Filter */}
            <div className="relative w-full md:w-48">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <select
                    name="city"
                    defaultValue={searchParams.get('city')?.toString()}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm appearance-none cursor-pointer"
                >
                    <option value="">{t('CityFilter')}</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {/* Condition Filter */}
            <div className="relative w-full md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <select
                    name="condition"
                    defaultValue={searchParams.get('condition')?.toString()}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm appearance-none cursor-pointer"
                >
                    <option value="">{t('ConditionFilter')}</option>
                    <option value="NEW">{tbf('Conditions.NEW')}</option>
                    <option value="GOOD">{tbf('Conditions.GOOD')}</option>
                    <option value="USED">{tbf('Conditions.USED')}</option>
                </select>
            </div>

            <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-md w-full md:w-auto">
                {t('Filter')}
            </button>
        </form>
    )
}
