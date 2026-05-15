'use client'

import { useState } from 'react'
import { UserRole } from '@prisma/client'
import { updateUserRole, toggleUserBan, deleteUser, createUserAdmin, getGlobalLoginHistory, getLoginHistory } from '@/lib/actions/users'
import { Shield, Ban, Trash2, UserPlus, CheckCircle, X, Search, Clock, Monitor, Globe } from 'lucide-react'

interface User {
    id: string
    email: string
    fullName: string | null
    role: UserRole
    isBanned: boolean
    createdAt: Date
    phone: string | null
}

interface LoginRecord {
    id: string
    userId: string
    ip: string | null
    userAgent: string | null
    createdAt: Date
    user?: {
        email: string
        fullName: string | null
        role: string
    }
}

export default function UsersClient({ initialUsers, initialPermissions }: { initialUsers: User[], initialPermissions: Record<string, string[]> }) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [search, setSearch] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        role: 'USER'
    })

    const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'HISTORY'>('USERS')
    
    // Historique
    const [globalHistory, setGlobalHistory] = useState<LoginRecord[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [selectedUserHistory, setSelectedUserHistory] = useState<{user: User, records: LoginRecord[]} | null>(null)
    
    // Nouveaux états pour la gestion des permissions
    const [permissions, setPermissions] = useState<Record<string, string[]>>(initialPermissions || {})
    const [selectedRole, setSelectedRole] = useState<string>('MANAGER')
    const [savingPermissions, setSavingPermissions] = useState(false)

    const AVAILABLE_MENUS = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'posts', label: 'Articles' },
        { id: 'books', label: 'Livres' },
        { id: 'digital-products', label: 'Livres Numériques' },
        { id: 'authors', label: 'Auteurs' },
        { id: 'packs', label: 'Packs' },
        { id: 'orders', label: 'Commandes' },
        { id: 'pos', label: 'Caisse (POS)' },
        { id: 'customers', label: 'Clients' },
        { id: 'reports', label: 'Signalements' },
        { id: 'reviews', label: 'Avis' },
        { id: 'coupons', label: 'Coupons' },
        { id: 'affiliates', label: 'Affiliés' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'finance', label: 'Finance' },
        { id: 'config', label: 'Configuration & Paramètres' }
    ]

    const handleTogglePermission = (role: string, menuId: string) => {
        setPermissions(prev => {
            const rolePerms = prev[role] || []
            if (rolePerms.includes(menuId)) {
                return { ...prev, [role]: rolePerms.filter(id => id !== menuId) }
            } else {
                return { ...prev, [role]: [...rolePerms, menuId] }
            }
        })
    }

    const handleSavePermissions = async () => {
        setSavingPermissions(true)
        try {
            const { updateSetting } = await import('@/lib/actions/site-settings')
            const res = await updateSetting('role_permissions', JSON.stringify(permissions), 'security', 'Permissions des rôles')
            if (res.success) {
                alert('Permissions enregistrées avec succès !')
            } else {
                alert(res.error)
            }
        } catch (e) {
            alert('Erreur lors de la sauvegarde')
        } finally {
            setSavingPermissions(false)
        }
    }

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(search.toLowerCase()) || 
        (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
    )

    const handleRoleChange = async (userId: string, role: string) => {
        const res = await updateUserRole(userId, role as UserRole)
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: role as UserRole } : u))
        } else {
            alert(res.error)
        }
    }

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        const res = await toggleUserBan(userId, !isBanned)
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !isBanned } : u))
        } else {
            alert(res.error)
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.')) return
        
        const res = await deleteUser(userId)
        if (res.success) {
            setUsers(users.filter(u => u.id !== userId))
        } else {
            alert(res.error)
        }
    }

    const loadGlobalHistory = async () => {
        setLoadingHistory(true)
        const res = await getGlobalLoginHistory()
        if (res.success && res.data) {
            setGlobalHistory(res.data as any)
        }
        setLoadingHistory(false)
    }

    const showUserHistory = async (user: User) => {
        setLoading(true)
        const res = await getLoginHistory(user.id)
        if (res.success && res.data) {
            setSelectedUserHistory({ user, records: res.data as any })
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createUserAdmin(formData)
        if (res.success) {
            window.location.reload()
        } else {
            alert(res.error)
            setLoading(false)
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('USERS')}
                    className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'USERS' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Utilisateurs
                </button>
                <button
                    onClick={() => setActiveTab('ROLES')}
                    className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'ROLES' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Rôles & Permissions
                </button>
                <button
                    onClick={() => {
                        setActiveTab('HISTORY')
                        loadGlobalHistory()
                    }}
                    className={`pb-4 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'HISTORY' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Historique
                </button>
            </div>

            {activeTab === 'USERS' && (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par email ou nom..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Nouvel Utilisateur
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Utilisateur</th>
                                        <th className="px-6 py-4">Date d'inscription</th>
                                        <th className="px-6 py-4">Rôle</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{user.fullName || 'Sans nom'}</div>
                                                <div className="text-gray-500">{user.email}</div>
                                                {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block w-full p-2 font-bold uppercase tracking-wider"
                                                >
                                                    <option value="USER">Utilisateur</option>
                                                    <option value="SELLER">Vendeur</option>
                                                    <option value="INFLUENCER">Influenceur</option>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="TEST">Test</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${user.isBanned ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    {user.isBanned ? 'Banni' : 'Actif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => showUserHistory(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Historique des connexions"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleBanToggle(user.id, user.isBanned)}
                                                        className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
                                                        title={user.isBanned ? 'Débannir' : 'Bannir'}
                                                    >
                                                        {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'ROLES' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 space-y-2">
                            <h3 className="font-bold text-gray-900 mb-4">Sélectionner un Rôle</h3>
                            {['MANAGER', 'SELLER', 'INFLUENCER', 'TEST'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors ${selectedRole === role ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {role} ({users.filter(u => u.role === role).length})
                                </button>
                            ))}
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                                Note: Les rôles ADMIN ont toujours un accès total. Les rôles USER n'ont aucun accès.
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                <h3 className="font-bold text-gray-900">Permissions : {selectedRole}</h3>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={savingPermissions}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {savingPermissions ? 'Enregistrement...' : 'Enregistrer les permissions'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {AVAILABLE_MENUS.map(menu => {
                                    const isChecked = permissions[selectedRole]?.includes(menu.id) || false
                                    return (
                                        <label key={menu.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleTogglePermission(selectedRole, menu.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 select-none">{menu.label}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Dernières connexions
                        </h3>
                        <button 
                            onClick={loadGlobalHistory}
                            disabled={loadingHistory}
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            {loadingHistory ? 'Chargement...' : 'Actualiser'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Date & Heure</th>
                                    <th className="px-6 py-4">IP / Appareil</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {globalHistory.length === 0 && !loadingHistory ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-400">Aucun historique disponible</td>
                                    </tr>
                                ) : (
                                    globalHistory.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{record.user?.fullName || 'Sans nom'}</div>
                                                <div className="text-gray-500 text-xs">{record.user?.email}</div>
                                                <div className="mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                        {record.user?.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(record.createdAt).toLocaleDateString('fr-FR')}
                                                </div>
                                                <div className="text-xs">
                                                    {new Date(record.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Globe className="w-3 h-3" />
                                                    <span className="text-xs font-mono">{record.ip || 'Inconnue'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Monitor className="w-3 h-3" />
                                                    <span className="text-[10px] truncate max-w-[200px]" title={record.userAgent || ''}>
                                                        {record.userAgent || 'Appareil inconnu'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Historique Utilisateur */}
            {selectedUserHistory && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-0 w-full max-w-2xl relative shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold leading-none">{selectedUserHistory.user.fullName || 'Utilisateur'}</h2>
                                    <p className="text-xs text-gray-500 mt-1">{selectedUserHistory.user.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedUserHistory(null)}
                                className="p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white sticky top-0 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-3">Date & Heure</th>
                                        <th className="px-6 py-3">IP / Appareil</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedUserHistory.records.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-gray-400 italic">Aucune donnée de connexion</td>
                                        </tr>
                                    ) : (
                                        selectedUserHistory.records.map(record => (
                                            <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">
                                                        {new Date(record.createdAt).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(record.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700 mb-1">
                                                        <Globe className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs font-mono">{record.ip || 'Inconnue'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Monitor className="w-3 h-3" />
                                                        <span className="text-[10px] line-clamp-1" title={record.userAgent || ''}>
                                                            {record.userAgent || 'Inconnu'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <button 
                                onClick={() => setSelectedUserHistory(null)}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajout Utilisateur */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md relative shadow-2xl">
                        <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold">Nouvel Utilisateur</h2>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rôle</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold uppercase tracking-wider text-sm"
                                >
                                    <option value="USER">Utilisateur</option>
                                    <option value="SELLER">Vendeur</option>
                                    <option value="INFLUENCER">Influenceur</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="TEST">Test</option>
                                </select>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50"
                            >
                                {loading ? 'Création...' : 'Créer l\'utilisateur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
