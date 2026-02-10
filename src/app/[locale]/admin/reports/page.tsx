import { getReports } from '@/lib/actions/reports'
import Link from 'next/link'
import ReportStatusUpdater from '@/components/admin/ReportStatusUpdater'
import { User, BookOpen, AlertCircle } from 'lucide-react'

export default async function AdminReportsPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const params = await searchParams
    const status = params.status || 'PENDING'
    const reports = await getReports(status)

    const statusOptions = [
        { value: 'PENDING', label: 'En attente' },
        { value: 'RESOLVED', label: 'Résolu' },
        { value: 'DISMISSED', label: 'Rejeté' },
        { value: 'ALL', label: 'Tous' }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-black text-black">Gestion des signalements</h1>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 mb-6">
                {statusOptions.map((option) => (
                    <Link
                        key={option.value}
                        href={`/admin/reports?status=${option.value}`}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${status === option.value
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {option.label}
                    </Link>
                ))}
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Signalé par</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Cible</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Raison</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <AlertCircle className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-bold text-gray-500">Aucun signalement trouvé.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            reports.map((report: any) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
                                                {report.reporter?.fullName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-black">{report.reporter?.fullName || 'Inconnu'}</p>
                                                <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.targetUser && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-bold text-sm text-black">{report.targetUser.fullName}</span>
                                            </div>
                                        )}
                                        {report.targetBook && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-400" />
                                                <span className="font-bold text-sm text-black">{report.targetBook.title}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold mb-1">
                                            {report.reason}
                                        </span>
                                        {report.details && (
                                            <p className="text-xs text-gray-600 max-w-xs line-clamp-2">{report.details}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <ReportStatusUpdater
                                                reportId={report.id}
                                                currentStatus={report.status}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
