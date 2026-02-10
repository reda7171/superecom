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
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Journal d'Audit</h1>
                    <p className="text-sm text-gray-500 font-medium">Historique des actions administratives</p>
                </div>
                <ExportButton
                    action={exportAuditLogs}
                    filename="audit_logs"
                    label="Exporter les logs"
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Entité</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                        Aucun log disponible.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.createdAt).toLocaleString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
                                            {log.adminId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                {entityIcons[log.entity] || <Tag className="w-4 h-4" />}
                                                {log.entity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.details || <span className="text-gray-300 italic">N/A</span>}
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
