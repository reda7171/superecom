import { getAllMenus } from '@/lib/actions/menus'
import MenuManager from '@/components/admin/MenuManager'

export default async function MenusPage() {
    const menus = await getAllMenus()

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Menus</h1>
                <p className="text-sm text-gray-500 mt-2">Gérez les menus de navigation de votre site</p>
            </div>

            <MenuManager initialMenus={menus} />
        </div>
    )
}
