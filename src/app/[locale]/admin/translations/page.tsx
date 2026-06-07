import { getTranslationsData } from '@/lib/actions/translations'
import TranslationManager from '@/components/admin/TranslationManager'
import { Languages } from 'lucide-react'
import { verifyAdmin } from '@/lib/actions/auth'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Gestion des Traductions | Admin SuperEcom',
}

export default async function AdminTranslationsPage() {
    await verifyAdmin();
    const data = await getTranslationsData();

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2">
                        Langues<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Internationalisation & Localisation (FR/AR/EN)
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-black text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10">
                        <Languages className="w-4 h-4 text-blue-400" />
                        <span>Moteur de Traduction Actif</span>
                    </div>
                </div>
            </div>

            <TranslationManager initialData={data} />
        </div>
    )
}
