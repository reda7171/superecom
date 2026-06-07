'use client'

import { useState } from 'react'
import { Flag, X, Loader2 } from 'lucide-react'
import { createReport } from '@/lib/actions/reports'
import { useTranslations } from 'next-intl'

export default function ReportButton({ targetProductId, targetUserId }: { targetProductId?: string, targetUserId?: string }) {
    const t = useTranslations('Community.Report')
    const tcmn = useTranslations('Common')
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await createReport({
            targetProductId,
            targetUserId,
            reason,
            details
        })

        setLoading(false)

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                setReason('')
                setDetails('')
            }, 2000)
        } else {
            setError(result.error || tcmn('Errors.UnexpectedError'))
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest mt-6 mx-auto group"
            >
                <Flag className="w-3 h-3 group-hover:fill-red-500 transition-colors" />
                {t('ButtonLabel')}
            </button>

            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-black text-black">{t('Title')}</h3>
                            <p className="text-sm font-bold text-gray-400">{t('Subtitle')}</p>
                        </div>

                        {success ? (
                            <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Flag className="w-6 h-6 text-green-600 fill-green-600" />
                                </div>
                                <p className="text-green-700 font-black mb-1 text-lg">{t('SuccessTitle')}</p>
                                <p className="text-xs text-green-600 font-bold uppercase tracking-widest">{t('SuccessDesc')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold text-center border border-red-100">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('ReasonLabel')}</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-black appearance-none text-black"
                                        >
                                            <option value="" disabled>{t('PlaceholderReason')}</option>
                                            <option value="SPAM">{t('Reasons.SPAM')}</option>
                                            <option value="INAPPROPRIATE">{t('Reasons.INAPPROPRIATE')}</option>
                                            <option value="FAKE">{t('Reasons.FAKE')}</option>
                                            <option value="SCAM">{t('Reasons.SCAM')}</option>
                                            <option value="OTHER">{t('Reasons.OTHER')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('DetailsLabel')}</label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        rows={3}
                                        className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-black resize-none text-black placeholder:text-gray-400"
                                        placeholder={t('PlaceholderDetails')}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-600/20 uppercase tracking-widest text-xs"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Submit')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
