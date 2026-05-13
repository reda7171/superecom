import { verifyAdmin } from '@/lib/actions/auth'
import { getAllSettings } from '@/lib/actions/site-settings'
import { redirect } from 'next/navigation'
import SiteSettingsForm from '@/components/admin/SiteSettingsForm'
import AdvancedSettingsForm from '@/components/admin/AdvancedSettingsForm'
import { Settings, Zap } from 'lucide-react'

export const metadata = {
    title: 'Paramètres du Site | Admin Riwaya',
    description: 'Configuration des paramètres du site'
}

export default async function AdminSettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    try {
        await verifyAdmin()
    } catch {
        redirect('/login')
    }

    const sp = await searchParams
    const activeTab = sp?.tab === 'advanced' ? 'advanced' : 'general'
    const settings = await getAllSettings()

    return (
        <div className="min-h-screen bg-pixio-cream/30 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                            <Settings className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-black tracking-tight">
                                Paramètres du Site
                            </h1>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                Contact, réseaux sociaux et fonctionnalités actives
                            </p>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="flex gap-2 border-b border-gray-200 pb-0">
                        <a
                            href="?tab=general"
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-black rounded-t-xl border-b-2 transition-colors ${activeTab === 'general'
                                ? 'border-black text-black bg-white'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Général
                        </a>
                        <a
                            href="?tab=advanced"
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-black rounded-t-xl border-b-2 transition-colors ${activeTab === 'advanced'
                                ? 'border-black text-black bg-white'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            Paramétrage Avancé
                        </a>
                    </div>
                </div>

                {/* Contenu de l'onglet actif */}
                {activeTab === 'general' ? (
                    <SiteSettingsForm initialSettings={settings} />
                ) : (
                    <AdvancedSettingsForm initialSettings={settings} />
                )}
            </div>
        </div>
    )
}
