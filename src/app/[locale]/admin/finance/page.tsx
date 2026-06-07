import { isAuthenticated } from '@/lib/actions/auth'
import { getExpenses, getFinancialStats } from '@/lib/actions/finance'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import ExpenseForm from '@/components/admin/ExpenseForm'
import ExpenseRowActions from '@/components/admin/ExpenseRowActions'
import { redirect } from 'next/navigation'

export default async function FinancePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params
    const { locale } = params

    const isAuth = await isAuthenticated()
    if (!isAuth) {
        redirect(`/${locale}/admin/login`)
    }

    const expenses = await getExpenses()
    const stats = await getFinancialStats()

    // Chiffre d'Affaire
    const grossRevenue = stats.totalRevenue

    // Marge Brute = Chiffre d'Affaire - Coût de revient moyen des articles vendus
    const grossMargin = grossRevenue - stats.totalCostOfGoodsSold

    // Total des autres dépenses (hors achats de livres, car le coût des livres est déjà déduit via CostOfGoodsSold)
    const operatingExpenses = expenses
        .filter(e => e.category !== 'BOOKS_PURCHASE')
        .reduce((sum, e) => sum + e.amount, 0)

    // D'un point de vue Trésorerie : Balance = Revenus encaissés - Toutes les dépenses décaissées
    // (L'argent réel qui reste en poche ou en banque, en comptant le stock payé d'avance)
    const cashBalance = stats.totalRevenue - stats.totalExpenses

    // D'un point de vue Rentabilité (Bénéfice Net Réel) :
    // Bénéfice = CA - Coût des articles vendus (Livres + frais fixes 2.65/cmd) - Autres charges (Ads globales, Transport, Salaires, etc.)
    const netProfit = grossMargin - operatingExpenses

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-black tracking-tighter mb-2 italic">
                        Finance<span className="text-emerald-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Rapports de rentabilité et gestion des flux
                    </p>
                </div>
                
                <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        Solde: {cashBalance.toFixed(0)} MAD
                    </span>
                </div>
            </div>

            {/* Stats Cards Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Chiffre d'Affaire", value: grossRevenue, icon: TrendingUp, color: "bg-black text-white", sub: "Ventes totales" },
                    { label: "Coût Vente", value: -stats.totalCostOfGoodsSold, icon: Wallet, color: "bg-orange-50 text-orange-600", sub: "Livres + Frais Fixes" },
                    { label: "Dépenses", value: -operatingExpenses, icon: TrendingDown, color: "bg-red-50 text-red-600", sub: "Hors achat stock" },
                    { label: "Bénéfice Net", value: netProfit, icon: TrendingUp, color: netProfit >= 0 ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200" : "bg-red-600 text-white shadow-xl shadow-red-200", sub: "Rentabilité réelle" }
                ].map((stat, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] border border-gray-100 bg-white relative overflow-hidden group transition-all hover:-translate-y-1 shadow-sm`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{stat.sub}</p>
                            </div>
                        </div>
                        <p className={`text-3xl font-black tracking-tighter ${stat.value < 0 ? 'text-red-600' : 'text-black'}`}>
                            {stat.value.toFixed(0)} <span className="text-xs font-bold">MAD</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Partenaires (Reda & Amine) Premium Layout */}
            <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                        <h2 className="text-2xl font-black tracking-tight uppercase">Partage des Bénéfices <span className="text-emerald-500 text-sm">(50/50)</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { name: "Reda", part: netProfit / 2, initial: "R" },
                            { name: "Amine", part: netProfit / 2, initial: "A" }
                        ].map((user, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 italic">Part de {user.name}</p>
                                    <p className={`text-4xl font-black tracking-tighter ${user.part >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {user.part.toFixed(0)} <span className="text-sm">MAD</span>
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-xl transition-transform group-hover:rotate-12">
                                    {user.initial}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expense Form Section */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-black">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-black tracking-tight">Ajouter une dépense</h2>
                </div>
                <ExpenseForm />
            </div>

            {/* Expenses List Premium */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Historique des Flux de Sortie</h2>
                    <div className="text-[10px] font-black text-red-600 bg-red-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-red-100">
                        {expenses.length} Dépenses
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                            <tr>
                                <th className="px-10 py-6">Date</th>
                                <th className="px-10 py-6">Opération</th>
                                <th className="px-10 py-6">Catégorie</th>
                                <th className="px-10 py-6 text-right">Montant</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Wallet className="w-16 h-16 mb-4 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Aucune dépense enregistrée</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {new Date(expense.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-black uppercase tracking-tight text-xs">{expense.title}</span>
                                                {expense.description && (
                                                    <span className="text-[10px] font-bold text-gray-400 mt-1 italic italic">"{expense.description}"</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-gray-200">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className="font-black text-red-600 text-sm tracking-tighter">
                                                -{expense.amount.toFixed(0)} MAD
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExpenseRowActions expense={expense} />
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
