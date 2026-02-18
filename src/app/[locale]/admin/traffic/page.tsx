import { isAuthenticated } from '@/lib/actions/auth'
import { getTrafficStats } from '@/lib/actions/analytics-traffic'
import { redirect } from 'next/navigation'
import { Eye, Users, MousePointer2, Clock, Globe } from 'lucide-react'

export default async function TrafficAnalyticsPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params
    const { locale } = params

    const isAuth = await isAuthenticated()
    if (!isAuth) {
        redirect(`/${locale}/admin/login`)
    }

    const stats = await getTrafficStats()

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-gray-900">Analyse du Trafic (Pixel)</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Vues Totales</p>
                        <p className="text-3xl font-black text-blue-600 mt-2">{stats.totalViews}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Eye className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Visiteurs Uniques</p>
                        <p className="text-3xl font-black text-purple-600 mt-2">{stats.uniqueVisitors}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                        <Users className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Pages Populaires</p>
                        <p className="text-3xl font-black text-green-600 mt-2">{stats.topPages.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl text-green-600">
                        <MousePointer2 className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Matrix */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-800">Flux d'activité en temps réel</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold text-center">
                                <tr>
                                    <th className="px-6 py-3 text-left">Page Vue</th>
                                    <th className="px-6 py-3">Utilisateur</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3 text-right">Moment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {stats.recentActivity.map((view) => (
                                    <tr key={view.id} className="hover:bg-blue-50 transition">
                                        <td className="px-6 py-4 font-mono text-xs text-blue-600 truncate max-w-[200px]" title={view.url}>
                                            {view.url.replace(/^https?:\/\/[^/]+/, '')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {view.user ? (
                                                <div className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">
                                                    {view.user.fullName}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Visiteur {view.sessionId?.slice(0, 4)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500 text-xs truncate max-w-[150px]" title={view.referrer || ''}>
                                            {view.referrer ? new URL(view.referrer).hostname : 'Direct'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500 bg-gray-50/50 font-mono text-xs">
                                            {new Date(view.createdAt).toLocaleTimeString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Pages List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Top Pages</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.topPages.map((page, idx) => (
                            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]" title={page.url}>
                                        {page.url.replace(/^https?:\/\/[^/]+/, '')}
                                    </span>
                                </div>
                                <span className="font-black text-gray-900">{page.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
