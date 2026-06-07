'use client'

import React, { useState } from 'react'
import { getAffiliates } from '@/lib/actions/affiliates'
import AffiliatesTable from '@/components/admin/AffiliatesTable'
import AffiliateForm from '@/components/admin/AffiliateForm'
import { Users, Plus, X } from 'lucide-react'

// Note: I will move the data fetching to a separate effect or use a wrapper.
// Since it's a page component, I'll turn it into a layout-like structure with a client-side part.

export default function AdminAffiliatesPage() {
    const [showForm, setShowForm] = useState(false)
    const [affiliates, setAffiliates] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    React.useEffect(() => {
        getAffiliates().then(data => {
            setAffiliates(data)
            setIsLoading(false)
        })
    }, [])

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Affiliés<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Gestion du programme d'affiliation et influenceurs
                    </p>
                </div>
                
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-xl active:scale-95 ${
                        showForm 
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-100' 
                            : 'bg-black hover:bg-black shadow-black/20'
                    }`}
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Fermer' : 'Nouveau Influenceur'}
                </button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-8 duration-500 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl shadow-black/5">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-black tracking-tight italic uppercase">Ajouter un partenaire</h2>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Créez un nouveau canal de distribution</p>
                        </div>
                        <div className="w-16 h-1 bg-black rounded-full" />
                    </div>
                    <AffiliateForm />
                </div>
            )}

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <div className="px-12 py-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Liste des Partenaires</h2>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-6 py-2 rounded-full uppercase tracking-widest border border-blue-100 shadow-sm">
                        {affiliates.length} Partenaires
                    </div>
                </div>
                {isLoading ? (
                    <div className="p-32 text-center">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronisation des données d'influence...</p>
                    </div>
                ) : (
                    <AffiliatesTable affiliates={affiliates} />
                )}
            </div>
        </div>
    )
}
