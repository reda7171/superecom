import { getSetting } from '@/lib/actions/site-settings'
import JumiaConfigForm from './JumiaConfigForm'
import { ShoppingBag } from 'lucide-react'

export const metadata = {
    title: 'Configuration Jumia | SuperEcom Admin'
}

export default async function JumiaConfigPage() {
    const jumiaEnabled = await getSetting('jumia_enabled', 'false')
    const jumiaEmail = await getSetting('jumia_email', '')
    const jumiaApiKey = await getSetting('jumia_api_key', '')
    const jumiaEnvironment = await getSetting('jumia_environment', 'sandbox')

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-black text-black tracking-tighter uppercase mb-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    Configuration Jumia
                </h1>
                <p className="text-gray-500 font-medium">Gérez l'intégration de l'API Vendeur Jumia pour synchroniser vos commandes et produits.</p>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
                <JumiaConfigForm 
                    initialEnabled={jumiaEnabled === 'true'}
                    initialEmail={jumiaEmail || ''}
                    initialApiKey={jumiaApiKey || ''}
                    initialEnvironment={jumiaEnvironment || 'sandbox'}
                />
            </div>
        </div>
    )
}
