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
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2 italic">
                        Signalements<span className="text-red-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Modération & Sécurité de la plateforme
                    </p>
                </div>
                
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2rem] w-fit shadow-inner">
                    {statusOptions.map((option) => (
                        <Link
                            key={option.value}
                            href={`/admin/reports?status=${option.value}`}
                            className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${status === option.value
                                    ? 'bg-white text-black shadow-md'
                                    : 'text-gray-500 hover:text-black'
                                }`}
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <tr>
                                <th className="px-8 py-6">Signalé par</th>
                                <th className="px-8 py-6">Cible</th>
                                <th className="px-8 py-6">Motif</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <AlertCircle className="w-16 h-16 mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Aucun signalement pour le moment</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10 font-black text-xs uppercase transition-transform group-hover:scale-110">
                                                    {report.reporter?.fullName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-black uppercase tracking-tight text-xs">{report.reporter?.fullName || 'Inconnu'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{report.reporter?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {report.targetUser && (
                                                <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50 w-fit">
                                                    <User className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="font-bold text-xs text-blue-700">{report.targetUser.fullName}</span>
                                                </div>
                                            )}
                                            {report.targetBook && (
                                                <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50 w-fit">
                                                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="font-bold text-xs text-emerald-700">{report.targetBook.title}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200 shadow-sm">
                                                    {report.reason}
                                                </span>
                                                {report.details && (
                                                    <p className="text-xs font-bold text-gray-600 max-w-xs line-clamp-1 italic group-hover:line-clamp-none transition-all">"{report.details}"</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {new Date(report.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
    )
}
