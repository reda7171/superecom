import { Link } from '@/i18n/routing'
import { getExchangeById } from '@/lib/actions/admin-exchanges'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, User, Phone, MapPin, Calendar, BookOpen, Repeat } from 'lucide-react'
import ExchangeStatusUpdater from '@/components/admin/ExchangeStatusUpdater'

export default async function ExchangeDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const exchange = await getExchangeById(id)

    if (!exchange) {
        notFound()
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/exchanges"
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    Retour à la liste
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
                                Échange <span className="text-gray-400">#</span>{exchange.id.slice(0, 8)}
                            </h1>
                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${exchange.type === 'DIRECT'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                                } shadow-sm`}>
                                {exchange.type === 'DIRECT' ? 'Direct' : 'Crédit'}
                            </span>
                        </div>
                        <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            <Calendar className="w-3 h-3 mr-2" />
                            Créé le {new Date(exchange.createdAt).toLocaleString('fr-FR')}
                        </p>
                    </div>

                    <ExchangeStatusUpdater
                        exchangeId={exchange.id}
                        currentStatus={exchange.status}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Book Requested */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900">Livre demandé</h2>
                        </div>
                        <span className="text-sm text-gray-500">Appartient à {exchange.responder.fullName}</span>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-24 h-36 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                            {exchange.bookRequested.image ? (
                                <Image
                                    src={exchange.bookRequested.image}
                                    alt={exchange.bookRequested.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-gray-300" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{exchange.bookRequested.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{exchange.bookRequested.author}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {exchange.bookRequested.condition}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Book Offered (or Credit info) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            {exchange.type === 'DIRECT' ? (
                                <BookOpen className="w-5 h-5 text-gray-400" />
                            ) : (
                                <Repeat className="w-5 h-5 text-gray-400" />
                            )}
                            <h2 className="text-lg font-bold text-gray-900">
                                {exchange.type === 'DIRECT' ? 'Livre proposé' : 'Contrepartie'}
                            </h2>
                        </div>
                        {exchange.type === 'DIRECT' && (
                            <span className="text-sm text-gray-500">Appartient à {exchange.requester.fullName}</span>
                        )}
                    </div>

                    {exchange.type === 'DIRECT' && exchange.bookOffered ? (
                        <div className="flex gap-4">
                            <div className="relative w-24 h-36 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                {exchange.bookOffered.image ? (
                                    <Image
                                        src={exchange.bookOffered.image}
                                        alt={exchange.bookOffered.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{exchange.bookOffered.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{exchange.bookOffered.author}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {exchange.bookOffered.condition}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-36 flex items-center justify-center bg-orange-50 rounded-lg border border-orange-100 text-center p-6">
                            <div>
                                <p className="font-medium text-orange-900 mb-1">Échange contre crédits</p>
                                <p className="text-sm text-orange-700">Cet échange n'implique pas de livre en retour.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Requester Info */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                        <User className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-900">Demandeur (Requester)</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {exchange.requester.image ? (
                                    <Image
                                        src={exchange.requester.image}
                                        alt={exchange.requester.fullName}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <User className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{exchange.requester.fullName}</p>
                                <p className="text-sm text-gray-500">{exchange.requester.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Ville</p>
                                <div className="flex items-center mt-1">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-900">{exchange.requester.city}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Téléphone</p>
                                <div className="flex items-center mt-1">
                                    <Phone className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-900">{exchange.requester.phone || 'Non renseigné'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Responder Info */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                        <User className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-900">Receveur (Propriétaire)</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {exchange.responder.image ? (
                                    <Image
                                        src={exchange.responder.image}
                                        alt={exchange.responder.fullName}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <User className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{exchange.responder.fullName}</p>
                                <p className="text-sm text-gray-500">{exchange.responder.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Ville</p>
                                <div className="flex items-center mt-1">
                                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-900">{exchange.responder.city}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Téléphone</p>
                                <div className="flex items-center mt-1">
                                    <Phone className="w-4 h-4 text-gray-400 mr-1" />
                                    <span className="text-sm text-gray-900">{exchange.responder.phone || 'Non renseigné'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {exchange.message && (
                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">Message d'échange</h3>
                    <p className="text-blue-800 italic">"{exchange.message}"</p>
                </div>
            )}
        </div>
    )
}
