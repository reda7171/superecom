import { JumiaAPI } from '@/lib/jumia-api'
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Commandes Jumia | SuperEcom Admin'
}

export default async function JumiaOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    
    const jumia = await JumiaAPI.getInstance()
    
    if (!jumia) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-orange-400" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Jumia n'est pas configuré</h2>
                <p className="text-slate-500 mb-8 max-w-md font-medium leading-relaxed">
                    Vous devez activer et configurer l'intégration Jumia pour voir vos commandes.
                </p>
                <Link 
                    href={`/${locale}/admin/config/jumia`}
                    className="px-8 py-4 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
                >
                    Configurer Jumia
                </Link>
            </div>
        )
    }

    let jumiaOrders = []
    let errorMsg = null

    try {
        // Le paramètre createdAfter cause une erreur 400, on revient à la méthode de base
        const response = await jumia.getOrders(100, 0)
        jumiaOrders = response?.orders || response?.data?.orders || []
    } catch (error: any) {
        errorMsg = error.message
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-inner">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        Commandes Jumia
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Synchronisation en direct via API Jumia
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Actualiser
                </button>
            </div>

            {errorMsg ? (
                <div className="bg-red-50 border border-red-200 p-6 rounded-3xl flex items-center gap-4 text-red-700">
                    <AlertCircle className="w-8 h-8 shrink-0" />
                    <div>
                        <h3 className="font-bold">Erreur de synchronisation</h3>
                        <p className="text-sm opacity-80">{errorMsg}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID Commande Jumia</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Client</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Statut</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {jumiaOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                                            Aucune commande trouvée sur Jumia.
                                        </td>
                                    </tr>
                                ) : (
                                    jumiaOrders.map((order: any, index: number) => (
                                        <tr key={order.id || order.number || index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5 font-bold text-slate-900">{order.number || order.OrderId || 'N/A'}</td>
                                            <td className="p-5 text-slate-500 font-medium">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                                            </td>
                                            <td className="p-5 font-medium text-slate-700">
                                                {order.shippingAddress?.firstName || order.CustomerFirstName} {order.shippingAddress?.lastName || order.CustomerLastName}
                                            </td>
                                            <td className="p-5">
                                                <span className="inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-orange-100 text-orange-700">
                                                    {order.status || order.Status || 'EN TRAITEMENT'}
                                                </span>
                                            </td>
                                            <td className="p-5 font-bold text-slate-900 text-right">
                                                {order.totalAmountLocal?.value || order.Price || order.GrandTotal || '0'} MAD
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
