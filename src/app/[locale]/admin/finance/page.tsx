import { isAuthenticated } from '@/lib/actions/auth'
import { getExpenses, getFinancialStats } from '@/lib/actions/finance'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import ExpenseForm from '@/components/admin/ExpenseForm'
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

    const balance = stats.totalRevenue - stats.totalExpenses

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-gray-900">Gestion Financière</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Revenus (Commandes)</p>
                        <p className="text-2xl font-black text-green-600 mt-2">{stats.totalRevenue.toFixed(2)} MAD</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Dépenses Totales</p>
                        <p className="text-2xl font-black text-red-600 mt-2">{stats.totalExpenses.toFixed(2)} MAD</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                </div>


                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Solde Net</p>
                        <p className={`text-2xl font-black mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {balance.toFixed(2)} MAD
                        </p>
                    </div>
                    <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                        <Wallet className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Expense Form */}
            <ExpenseForm />

            {/* Expenses List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Historique des Dépenses</h2>
                </div>
                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucune dépense enregistrée.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Titre</th>
                                <th className="px-6 py-3">Catégorie</th>
                                <th className="px-6 py-3 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(expense.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {expense.title}
                                        {expense.description && (
                                            <span className="block text-xs text-gray-400 font-normal">{expense.description}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase tracking-wider">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-red-600">
                                        -{expense.amount.toFixed(2)} MAD
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
