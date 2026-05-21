'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { register } from '@/lib/actions/community-auth'
import { Link, useRouter } from '@/i18n/routing'
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { MOROCCO_CITIES } from '@/lib/constants/cities'
import { fbPixelEvents } from '@/lib/facebook-pixel'

export default function RegisterForm() {
    const t = useTranslations('Community')
    const tm = useTranslations('Community.Market')
    const tcmn = useTranslations('Common')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await register(formData)

        if (res.success) {
            fbPixelEvents.completeRegistration()
            router.push('/community')
            router.refresh()
        } else {
            setError(res.error || tcmn('Errors.UnexpectedError'))
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-black tracking-tighter mb-2">{t('RegisterTitle')}</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('RegisterSubtitle')}</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-black/5 border border-gray-100">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('FullName')}</label>
                        <input name="fullName" required className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black" placeholder="Taha Hussein" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Email')}</label>
                        <input name="email" type="email" required className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black" placeholder="hello@example.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Phone')}</label>
                        <input name="phone" type="tel" required className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black" placeholder="0612345678" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Password')}</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-6 pr-12 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-black/5"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('City')}</label>
                        <div className="relative">
                            <select
                                name="city"
                                required
                                defaultValue=""
                                className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black appearance-none cursor-pointer"
                            >
                                <option value="" disabled>{t('ChooseCity')}</option>
                                {MOROCCO_CITIES.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('RegisterButton')}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-gray-400">
                        {t('AlreadyAccount')} <Link href="/community/login" className="text-black underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors">{t('LoginButton')}</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
