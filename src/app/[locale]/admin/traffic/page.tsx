import { isAuthenticated } from '@/lib/actions/auth'
import { getTrafficStats } from '@/lib/actions/analytics-traffic'
import { redirect } from 'next/navigation'
import { Eye, Users, MousePointer2 } from 'lucide-react'
import ActivityFeed from '@/components/admin/ActivityFeed'
import { Link } from '@/i18n/routing'

export default async function TrafficAnalyticsPage(props: { 
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ period?: string }> 
}) {
    const params = await props.params
    const searchParams = await props.searchParams
    const { locale } = params
    const period = (searchParams.period || 'all') as any

    const isAuth = await isAuthenticated()
    if (!isAuth) {
        redirect(`/${locale}/admin/login`)
    }

    const stats = await getTrafficStats(period)

    const periods = [
        { label: 'Aujourd\'hui', value: 'today' },
        { label: 'Hier', value: 'yesterday' },
        { label: '7 derniers jours', value: 'week' },
        { label: '30 derniers jours', value: 'month' },
        { label: 'Tout', value: 'all' },
    ]

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2 italic">
                        Traffic<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Surveillance en temps réel du comportement utilisateur
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-[2rem] shadow-inner">
                    {periods.map((p) => (
                        <Link
                            key={p.value}
                            href={`/admin/traffic?period=${p.value}`}
                            className={`px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                                period === p.value 
                                    ? 'bg-white text-black shadow-md' 
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            {p.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* KPI Cards Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: "Vues Totales", value: stats.totalViews, icon: Eye, color: "bg-blue-600 text-white shadow-xl shadow-blue-200" },
                    { label: "Visiteurs Uniques", value: stats.uniqueVisitors, icon: Users, color: "bg-purple-600 text-white shadow-xl shadow-purple-200" },
                    { label: "Pages Populaires", value: stats.topPages.length, icon: MousePointer2, color: "bg-black text-white" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <p className="text-4xl font-black text-black tracking-tighter">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Activity Matrix with Filters */}
                <div className="lg:col-span-2">
                    <ActivityFeed initialActivity={stats.recentActivity as any} />
                </div>

                {/* Top Pages List Premium */}
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden h-fit">
                    <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/50">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Destinations Populaires</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {stats.topPages.length === 0 ? (
                            <div className="px-10 py-12 text-center text-gray-400 italic font-bold">Aucune donnée</div>
                        ) : (
                            stats.topPages.map((page, idx) => (
                                <div key={idx} className="px-10 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black italic shadow-sm border ${
                                            idx < 3 ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 group-hover:border-gray-200'
                                        }`}>
                                            0{idx + 1}
                                        </span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-black text-black uppercase tracking-tight truncate max-w-[180px] italic" title={page.url}>
                                                {page.url.replace(/^https?:\/\/[^/]+/, '') || '/'}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Landing Page</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-black tracking-tighter">{page.count}</span>
                                        <span className="text-[9px] font-black text-gray-300 ml-1">VUES</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
