import { getAuditLogs } from '@/lib/actions/audit'
import { Clock, User, Tag, FileText } from 'lucide-react'
import ExportButton from '@/components/admin/ExportButton'
import { exportAuditLogs } from '@/lib/actions/export'

export default async function AuditPage() {
    const logs = await getAuditLogs(100)

    const entityIcons: any = {
        BOOK: <Tag className="w-4 h-4" />,
        PACK: <Tag className="w-4 h-4 text-purple-600" />,
        ORDER: <FileText className="w-4 h-4 text-blue-600" />,
        AUTH: <User className="w-4 h-4 text-red-600" />,
        COUPON: <Tag className="w-4 h-4 text-green-600" />,
    }

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2">
                        Audit<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Historique complet des actions administratives
                    </p>
                </div>
                
                <ExportButton
                    action={exportAuditLogs}
                    filename="audit_logs"
                    label="Exporter les logs"
                />
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <tr>
                                <th className="px-8 py-6">Horodatage</th>
                                <th className="px-8 py-6">Admin</th>
                                <th className="px-8 py-6">Action</th>
                                <th className="px-8 py-6">Entité</th>
                                <th className="px-8 py-6">Détails de l'opération</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Clock className="w-16 h-16 mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Aucun log disponible</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(log.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100 shadow-sm">
                                                    ID
                                                </div>
                                                <span className="font-bold text-black text-xs italic tracking-tighter">{log.adminId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                                log.action === 'DELETE' ? 'bg-red-50 text-red-600 border-red-100' :
                                                log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-gray-50 text-gray-500 border-gray-100'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-600 uppercase tracking-tighter">
                                                {entityIcons[log.entity] || <Tag className="w-4 h-4" />}
                                                {log.entity}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-gray-600 italic leading-relaxed max-w-md line-clamp-1 group-hover:line-clamp-none transition-all">
                                                {log.details || "N/A"}
                                            </p>
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
