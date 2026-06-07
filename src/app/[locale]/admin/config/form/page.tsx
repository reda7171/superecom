import { verifyAdmin } from '@/lib/actions/auth'
import { getSetting, getSettingsByCategory } from '@/lib/actions/site-settings'
import { redirect } from 'next/navigation'
import FormConfig from './FormConfig'
import { Settings } from 'lucide-react'

export const metadata = {
    title: 'Configuration Formulaire | Admin SuperEcom',
}

export default async function FormConfigPage() {
    try {
        await verifyAdmin()
    } catch {
        redirect('/login')
    }

    const formSettings = await getSettingsByCategory('form')

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2 italic">
                        Formulaire<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Configuration dynamique des champs de checkout
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 p-12">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-black tracking-tight uppercase">Structure des données</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Activation et visibilité des champs clients</p>
                        </div>
                    </div>
                    <FormConfig initialData={formSettings} />
                </div>
            </div>
        </div>
    )
}
