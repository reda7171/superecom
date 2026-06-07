'use client'

import React, { useState } from 'react'
import { 
    Users, 
    ShoppingBag, 
    MapPin, 
    Phone, 
    Edit2, 
    Trash2, 
    X, 
    Save, 
    Loader2,
    Search,
    Plus,
    Mail
} from 'lucide-react'
import { updateCustomer, deleteCustomer, createCustomer } from '@/lib/actions/customers'

interface Customer {
    id: string
    fullName: string
    phone: string
    email?: string
    city?: string
    address?: string
    totalOrders: number
    totalSpent: number
    lastOrderDate: Date
}

interface CustomersTableProps {
    initialCustomers: Customer[]
    externalSearch?: string
    setIsCreating?: (val: boolean) => void
}

export default function CustomersTable({ initialCustomers, externalSearch = '', setIsCreating: setExternalIsCreating }: CustomersTableProps) {
    const [customers, setCustomers] = useState(initialCustomers)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    React.useEffect(() => {
        const handleOpen = () => setIsCreating(true)
        window.addEventListener('open-customer-modal', handleOpen)
        return () => window.removeEventListener('open-customer-modal', handleOpen)
    }, [])

    // Filtrage
    const filteredCustomers = customers.filter(c => 
        c.fullName.toLowerCase().includes(externalSearch.toLowerCase()) ||
        c.phone.includes(externalSearch) ||
        (c.city || '').toLowerCase().includes(externalSearch.toLowerCase())
    )

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingCustomer) return

        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const data = {
            fullName: formData.get('fullName') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            city: formData.get('city') as string,
            address: formData.get('address') as string,
        }

        const result = await updateCustomer(editingCustomer.id, data)
        
        if (result.success) {
            setCustomers(prev => prev.map(c => 
                c.id === editingCustomer.id ? { ...c, ...data } : c
            ))
            setEditingCustomer(null)
        } else {
            setError(result.error || 'Erreur lors de la mise à jour')
        }
        setLoading(false)
    }

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const data = {
            fullName: formData.get('fullName') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            city: formData.get('city') as string,
            address: formData.get('address') as string,
        }

        const result = await createCustomer(data)
        
        if (result.success) {
            // Re-fetch or manual update (simple re-fetch for now)
            window.location.reload()
        } else {
            setError(result.error || 'Erreur lors de la création')
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return

        setIsDeleting(id)
        const result = await deleteCustomer(id)
        
        if (result.success) {
            setCustomers(prev => prev.filter(c => c.id !== id))
        }
        setIsDeleting(null)
    }

    return (
        <div className="space-y-6">
            {/* Barre d'action */}
            {/* Actions removed - moved to CustomerFilters */}

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden font-sans">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Lecteur</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Localisation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Historique</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Valeur</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users className="w-12 h-12 text-gray-100" />
                                            <p className="text-gray-400 font-bold">Aucun lecteur trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-pixio-cream/30 transition-colors">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-black/10">
                                                    {customer.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-black leading-none mb-1">{customer.fullName}</p>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3" />
                                                            {customer.phone}
                                                        </p>
                                                        {customer.email && (
                                                            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 lowercase">
                                                                <Mail className="w-3 h-3" />
                                                                {customer.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-2 text-sm font-bold text-black">
                                                <MapPin className="w-4 h-4 text-gray-300" />
                                                {customer.city || 'Non renseigné'}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 truncate max-w-[200px]">
                                                {customer.address || 'Aucune adresse'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                                    <ShoppingBag className="w-3 h-3" />
                                                    {customer.totalOrders} commandes
                                                </div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase">
                                                    Actif le: {new Date(customer.lastOrderDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <p className="text-xl font-black text-black tracking-tighter">
                                                {customer.totalSpent.toFixed(0)} <span className="text-[10px] text-gray-400 uppercase ml-1">MAD</span>
                                            </p>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => setEditingCustomer(customer)}
                                                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all active:scale-90"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer.id)}
                                                    disabled={isDeleting === customer.id}
                                                    className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                                                >
                                                    {isDeleting === customer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Création/Édition */}
            {(isCreating || editingCustomer) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-pixio-cream/20">
                            <div>
                                <h3 className="text-3xl font-black text-black tracking-tighter">
                                    {isCreating ? 'Nouveau Lecteur' : 'Profil Lecteur'}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                    {isCreating ? 'Ajouter manuellement à la base' : 'Édition des informations de contact'}
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsCreating(false)
                                    setEditingCustomer(null)
                                    setError(null)
                                }}
                                className="p-4 hover:bg-white rounded-[2rem] transition-colors shadow-sm"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={isCreating ? handleCreate : handleUpdate} className="p-12 space-y-10">
                            {error && (
                                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 text-xs font-black uppercase tracking-widest text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Identité complète</label>
                                    <input 
                                        name="fullName"
                                        defaultValue={editingCustomer?.fullName}
                                        required
                                        placeholder="Ex: Reda Bench"
                                        className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Numéro WhatsApp</label>
                                    <input 
                                        name="phone"
                                        defaultValue={editingCustomer?.phone}
                                        required
                                        placeholder="Ex: 0612345678"
                                        className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email (Optionnel)</label>
                                    <input 
                                        name="email"
                                        type="email"
                                        defaultValue={editingCustomer?.email || ''}
                                        placeholder="Ex: contact@superEcom.com"
                                        className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Ville de résidence</label>
                                    <input 
                                        name="city"
                                        defaultValue={editingCustomer?.city || ''}
                                        placeholder="Ex: Casablanca"
                                        className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Adresse de livraison détaillée</label>
                                    <textarea 
                                        name="address"
                                        defaultValue={editingCustomer?.address || ''}
                                        placeholder="Numéro, rue, quartier..."
                                        rows={3}
                                        className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black text-sm resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-5 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setEditingCustomer(null)
                                        setError(null)
                                    }}
                                    className="flex-1 py-6 bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Fermer sans enregistrer
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-2 py-6 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isCreating ? 'Confirmer la création' : 'Mettre à jour le lecteur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
