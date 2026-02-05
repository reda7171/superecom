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
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Code</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Réduction</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Min. Achat</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic font-medium">
                    {coupons.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Aucun coupon disponible</td>
                        </tr>
                    ) : (
                        coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-sm uppercase">
                                        {coupon.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-bold text-gray-900">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.discount}%` : `${coupon.discount} MAD`}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {coupon.minAmount ? `${coupon.minAmount} MAD` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {coupon.isActive ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                                            <CheckCircle2 className="w-3 h-3" /> Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
                                            <XCircle className="w-3 h-3" /> Inactif
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
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
