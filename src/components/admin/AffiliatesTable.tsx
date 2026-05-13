'use client'

import { deleteAffiliate } from '@/lib/actions/affiliates'
import { Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AffiliatesTable({ affiliates }: { affiliates: any[] }) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cet affilié ?')) return
        const res = await deleteAffiliate(id)
        if (res.success) router.refresh()
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Influenceur</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Code Promo</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Paramètres</th>
                        <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Performance</th>
                        <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Revenus</th>
                        <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Commission</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Statut</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {affiliates.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-10 py-20 text-center text-gray-300 italic font-medium uppercase tracking-widest text-[10px]">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                        <XCircle className="w-6 h-6 opacity-20" />
                                    </div>
                                    Aucun partenaire enregistré
                                </div>
                            </td>
                        </tr>
                    ) : (
                        affiliates.map((affiliate) => (
                            <tr key={affiliate.id} className="hover:bg-gray-50/50 group transition-all">
                                <td className="px-10 py-6 whitespace-nowrap">
                                    <span className="font-black text-black text-[11px] uppercase tracking-tight italic">{affiliate.affiliateName}</span>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap">
                                    <span className="bg-black text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10">
                                        {affiliate.code}
                                    </span>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-black font-black text-[10px] uppercase tracking-widest">
                                            R: <span className="text-blue-600">{affiliate.type === 'PERCENTAGE' ? `${affiliate.discount}%` : `${affiliate.discount} MAD`}</span>
                                        </span>
                                        <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">
                                            C: <span className="text-black">{affiliate.type === 'PERCENTAGE' ? `${affiliate.commission}%` : `${affiliate.commission} MAD/L`}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap text-center">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-black font-black text-[11px] uppercase tracking-tighter">{affiliate.usageCount || 0} CMD</span>
                                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{affiliate.totalItemsCount || 0} LIVRES</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap text-center">
                                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm uppercase tracking-tighter italic">
                                        {affiliate.generatedRevenue?.toFixed(0) || 0} MAD
                                    </span>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap text-center">
                                    <span className="text-[11px] font-black text-amber-600 bg-amber-50/50 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm uppercase tracking-tighter italic">
                                        {affiliate.totalCommission?.toFixed(0) || 0} MAD
                                    </span>
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap">
                                    {affiliate.isActive ? (
                                        <span className="inline-flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIF
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 text-red-400 text-[9px] font-black uppercase tracking-widest italic opacity-60">
                                            <XCircle className="w-3.5 h-3.5" /> INACTIF
                                        </span>
                                    )}
                                </td>
                                <td className="px-10 py-6 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleDelete(affiliate.id)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
