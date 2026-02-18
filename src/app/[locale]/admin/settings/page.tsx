import { verifyAdmin } from '@/lib/actions/auth'
import { getAllSettings } from '@/lib/actions/site-settings'
import { redirect } from 'next/navigation'
import SiteSettingsForm from '@/components/admin/SiteSettingsForm'
import { Settings } from 'lucide-react'

export const metadata = {
    title: 'Paramètres du Site | Admin Riwaya',
    description: 'Configuration des paramètres du site'
}

export default async function AdminSettingsPage() {
    try {
        await verifyAdmin()
    } catch {
        redirect('/login')
    }

    const settings = await getAllSettings()

    return (
        <div className="min-h-screen bg-pixio-cream/30 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                            <Settings className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-black tracking-tight">
                                Paramètres du Site
                            </h1>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                Configurez les informations de contact et réseaux sociaux
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulaire */}
                <SiteSettingsForm initialSettings={settings} />
            </div>
        </div>
    )
}
