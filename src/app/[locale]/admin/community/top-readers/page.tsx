import { getTopReaders } from '@/lib/actions/community'
import { verifyAdmin } from '@/lib/actions/auth'
import Image from 'next/image'
import { Crown, BookOpen, Medal, MapPin } from 'lucide-react'

export const metadata = {
    title: 'Top Lecteurs | Admin Riwaya',
    description: 'Classement des meilleurs lecteurs de la communauté'
}

export default async function TopReadersAdminPage() {
    await verifyAdmin()
    const topReaders = await getTopReaders(100)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-black tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                            <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                        Classement des Lecteurs
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium ml-16">
                        Liste des utilisateurs ayant terminé le plus de livres (statut: COMPLETED)
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-5 px-6 text-left text-xs font-black uppercase tracking-widest text-gray-400 w-24">Rang</th>
                                <th className="py-5 px-6 text-left text-xs font-black uppercase tracking-widest text-gray-400">Lecteur</th>
                                <th className="py-5 px-6 text-left text-xs font-black uppercase tracking-widest text-gray-400">Ville</th>
                                <th className="py-5 px-6 text-right text-xs font-black uppercase tracking-widest text-gray-400">Livres Lus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topReaders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-gray-400 font-medium">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        Aucun lecteur n'a encore terminé de livre.
                                    </td>
                                </tr>
                            ) : (
                                topReaders.map((reader, index) => (
                                    <tr key={reader.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 group">
                                        <td className="py-4 px-6">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 ring-offset-2' :
                                                    index === 1 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-400 ring-offset-2' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400 ring-offset-2' :
                                                            'bg-gray-50 text-gray-400'
                                                }`}>
                                                {index === 0 ? <Crown className="w-5 h-5 fill-yellow-700" /> :
                                                    index === 1 ? <Medal className="w-5 h-5" /> :
                                                        index === 2 ? <Medal className="w-5 h-5" /> :
                                                            `#${index + 1}`}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-300">
                                                    {reader.image ? (
                                                        <Image
                                                            src={reader.image}
                                                            alt={reader.fullName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-pixio-cream text-black font-black text-xs uppercase">
                                                            {reader.fullName.substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm group-hover:text-black transition-colors">{reader.fullName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">ID: {reader.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {reader.city ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs font-bold text-gray-600 border border-gray-100">
                                                    <MapPin className="w-3 h-3" />
                                                    {reader.city}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs font-bold">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl shadow-lg shadow-black/10 group-hover:bg-gray-800 transition-colors">
                                                <BookOpen className="w-4 h-4 text-pixio-yellow" />
                                                <span className="font-black text-lg">{reader.readCount}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
