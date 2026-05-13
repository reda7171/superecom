'use client'

import { deleteCoupon } from '@/lib/actions/coupons'
import { Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CouponsTable({ coupons }: { coupons: any[] }) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce coupon ?')) return
        const res = await deleteCoupon(id)
        if (res.success) router.refresh()
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Code</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Réduction</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Min. Achat</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Statut</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {coupons.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Trash2 className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aucun coupon actif</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        coupons.map((coupon) => (
                            <tr key={coupon.id} className="group hover:bg-gray-50/30 transition-colors">
                                <td className="px-8 py-7 whitespace-nowrap">
                                    <span className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">
                                        {coupon.code}
                                    </span>
                                </td>
                                <td className="px-8 py-7 whitespace-nowrap">
                                    <p className="text-lg font-black text-black tracking-tighter">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.discount}%` : `${coupon.discount} MAD`}
                                    </p>
                                </td>
                                <td className="px-8 py-7 whitespace-nowrap">
                                    <p className="text-xs font-bold text-gray-500 uppercase">
                                        {coupon.minAmount ? `${coupon.minAmount} MAD` : 'Sans minimum'}
                                    </p>
                                </td>
                                <td className="px-8 py-7 whitespace-nowrap">
                                    {coupon.isActive ? (
                                        <span className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <XCircle className="w-3 h-3" /> Inactif
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-7 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
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
