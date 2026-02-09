'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { login } from '@/lib/actions/community-auth'
import { Link, useRouter } from '@/i18n/routing'
import { Loader2, ArrowRight } from 'lucide-react'

export default function LoginForm() {
    const t = useTranslations('Community')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const res = await login(formData)

        if (res.success) {
            router.push('/community')
            router.refresh()
        } else {
            setError(res.error || "An error occurred")
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-black tracking-tighter mb-2">{t('LoginTitle')}</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('LoginSubtitle')}</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-black/5 border border-gray-100">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Email')}</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                            placeholder="hello@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('Password')}</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-6 py-4 bg-pixio-cream/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold text-black"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('LoginButton')}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-gray-400">
                        {t('NoAccount')} <Link href="/community/register" className="text-black underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors">{t('RegisterButton')}</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
