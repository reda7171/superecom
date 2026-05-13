import { getUsers } from '@/lib/actions/users'
import UsersClient from './UsersClient'
import { Users } from 'lucide-react'

import { getSetting } from '@/lib/actions/site-settings'

export const metadata = {
    title: 'Gestion des Utilisateurs | Admin',
}

export default async function UsersPage() {
    const res = await getUsers()
    const users = res.success && res.data ? res.data : []
    
    const permissionsSetting = await getSetting('role_permissions', '{}')
    const initialPermissions = JSON.parse(permissionsSetting || '{}')

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-black" />
                        Utilisateurs & Rôles
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Gérez les accès, les rôles et bannissez les utilisateurs abusifs.</p>
                </div>
            </div>

            <UsersClient initialUsers={users} initialPermissions={initialPermissions} />
        </div>
    )
}
