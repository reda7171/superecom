'use client'

import { useState } from 'react'
import { Check, X, Store, Mail, Phone, MapPin } from 'lucide-react'
import { updateSellerRequestStatus, deleteSellerRequest } from '@/lib/actions/seller-requests'

export default function SellerRequestsTable({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests)
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }))
        const res = await updateSellerRequestStatus(id, newStatus)
        if (res.success) {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
        } else {
            alert(res.error)
        }
        setLoadingMap(prev => ({ ...prev, [id]: false }))
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return
        setLoadingMap(prev => ({ ...prev, [id]: true }))
        const res = await deleteSellerRequest(id)
        if (res.success) {
            setRequests(prev => prev.filter(r => r.id !== id))
        } else {
            alert(res.error)
        }
        setLoadingMap(prev => ({ ...prev, [id]: false }))
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg">Approuvé</span>
            case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-black rounded-lg">Rejeté</span>
            default: return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-black rounded-lg">En attente</span>
        }
    }

    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <tr>
                            <th className="px-8 py-6">Boutique</th>
                            <th className="px-8 py-6">Contact</th>
                            <th className="px-8 py-6">Localisation & Stock</th>
                            <th className="px-8 py-6">Statut</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-24 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <Store className="w-16 h-16 mb-4 opacity-10" />
                                        <p className="font-black uppercase tracking-widest text-[10px]">Aucune demande pour le moment</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10 transition-transform group-hover:scale-110">
                                                <Store className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-black uppercase tracking-tight">{req.storeName}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                                    Gérant: {req.managerName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-bold text-gray-600 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                {req.email}
                                            </div>
                                            <div className="text-xs font-bold text-blue-600 flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-blue-400" />
                                                {req.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-bold text-gray-600 flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {req.city}
                                            </div>
                                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                                                Stock: {req.stockSize}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {req.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        disabled={loadingMap[req.id]}
                                                        onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                        title="Approuver"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        disabled={loadingMap[req.id]}
                                                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                                                        title="Rejeter"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                disabled={loadingMap[req.id]}
                                                onClick={() => handleDelete(req.id)}
                                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-gray-100">
                {requests.length === 0 ? (
                    <div className="px-8 py-24 text-center text-gray-400">
                        <Store className="w-12 h-12 mb-4 opacity-10 mx-auto" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Aucune demande</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-black uppercase tracking-tight">{req.storeName}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{req.city}</div>
                                    </div>
                                </div>
                                {getStatusBadge(req.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                                    <p className="text-xs font-bold text-black truncate">{req.email}</p>
                                    <p className="text-xs font-bold text-blue-600">{req.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gérant & Stock</p>
                                    <p className="text-xs font-bold text-black truncate">{req.managerName}</p>
                                    <p className="text-xs font-black text-emerald-600">{req.stockSize}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {req.status === 'PENDING' ? (
                                    <>
                                        <button
                                            disabled={loadingMap[req.id]}
                                            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            Approuver
                                        </button>
                                        <button
                                            disabled={loadingMap[req.id]}
                                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                            className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                        >
                                            Rejeter
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        disabled={loadingMap[req.id]}
                                        onClick={() => handleDelete(req.id)}
                                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                    >
                                        Supprimer la demande
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
