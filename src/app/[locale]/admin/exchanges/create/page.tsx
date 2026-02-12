import { Link } from '@/i18n/routing'
import { ArrowLeft } from 'lucide-react'
import CreateExchangeForm from '@/components/admin/CreateExchangeForm'

export default function CreateExchangePage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/exchanges"
                    className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux échanges
                </Link>

                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Nouvel Échange Manuel</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                    Créez un enregistrement d'échange entre deux membres de la communauté
                </p>
            </div>

            <CreateExchangeForm />
        </div>
    )
}
