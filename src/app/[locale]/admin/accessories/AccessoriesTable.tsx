'use client'

import { useState } from 'react'
import { 
    Edit, 
    Trash2, 
    Eye, 
    MoreHorizontal, 
    Search,
    Filter,
    Package,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Accessory {
    id: string
    name: string
    description: string | null
    price: number
    costPrice: number
    stock: number
    image: string | null
    category: string
    active: boolean
    createdAt: string
}

export default function AccessoriesTable({ 
    initialData, 
    locale 
}: { 
    initialData: Accessory[], 
    locale: string 
}) {
    const [data, setData] = useState(initialData)
    const [search, setSearch] = useState('')

    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    )

    async function handleDelete(id: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
        
        try {
            const res = await fetch(`/api/admin/accessories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setData(prev => prev.filter(item => item.id !== id))
            } else {
                alert('Erreur lors de la suppression')
            }
        } catch (err) {
            alert('Erreur technique')
        }
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header / Actions */}
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Produit</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Prix</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Stock</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Statut</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 relative">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{item.description || 'Pas de description'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900">{item.price} DH</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Coût: {item.costPrice} DH</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${item.stock <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                                            {item.stock}
                                        </span>
                                        {item.stock <= 5 && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        item.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}>
                                        {item.active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/${locale}/admin/accessories/${item.id}`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredData.length === 0 && (
                <div className="p-20 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Aucun produit trouvé</p>
                </div>
            )}
        </div>
    )
}
