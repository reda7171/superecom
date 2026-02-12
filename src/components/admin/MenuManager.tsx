'use client'

import { useState } from 'react'
import { Plus, GripVertical, Trash2, Edit2, Eye, EyeOff, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import { createMenu, createMenuItem, deleteMenuItem, updateMenuItem, updateMenuOrder, deleteMenu, updateMenu } from '@/lib/actions/menus'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

type MenuItem = {
    id: string
    label: string
    url: string
    order: number
    isActive: boolean
    parentId: string | null
    children?: MenuItem[]
}

type Menu = {
    id: string
    name: string
    label: string
    isActive: boolean
    items: MenuItem[]
}

export default function MenuManager({ initialMenus }: { initialMenus: Menu[] }) {
    const router = useRouter()
    const [menus, setMenus] = useState<Menu[]>(initialMenus)
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(initialMenus[0] || null)
    const [showNewMenuForm, setShowNewMenuForm] = useState(false)
    const [showNewItemForm, setShowNewItemForm] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    // Formulaires
    const [newMenuData, setNewMenuData] = useState({ name: '', label: '' })
    const [newItemData, setNewItemData] = useState({ label: '', url: '', parentId: '' })

    const handleCreateMenu = async () => {
        const result = await createMenu(newMenuData)
        if (result.success) {
            setNewMenuData({ name: '', label: '' })
            setShowNewMenuForm(false)
            router.refresh()
        }
    }

    const handleCreateItem = async () => {
        if (!selectedMenu) return

        const result = await createMenuItem({
            menuId: selectedMenu.id,
            label: newItemData.label,
            url: newItemData.url,
            parentId: newItemData.parentId || null
        })

        if (result.success) {
            setNewItemData({ label: '', url: '', parentId: '' })
            setShowNewItemForm(false)
            router.refresh()
        }
    }

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Supprimer cet élément ?')) return
        await deleteMenuItem(id)
        router.refresh()
    }

    const handleToggleActive = async (item: MenuItem) => {
        await updateMenuItem(item.id, { isActive: !item.isActive })
        router.refresh()
    }

    const handleDeleteMenu = async (id: string) => {
        if (!confirm('Supprimer ce menu et tous ses éléments ?')) return
        await deleteMenu(id)
        setSelectedMenu(null)
        router.refresh()
    }

    const handleToggleMenu = async (menu: Menu) => {
        await updateMenu(menu.id, { isActive: !menu.isActive })
        router.refresh()
    }

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedItems(newExpanded)
    }

    const onDragEnd = async (result: any) => {
        if (!result.destination || !selectedMenu) return

        // On ne gère que le réordonnancement des éléments racine pour l'instant
        const rootItems = selectedMenu.items.filter(item => !item.parentId)
        const otherItems = selectedMenu.items.filter(item => item.parentId)

        const items = Array.from(rootItems)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        // Mise à jour de l'ordre (order)
        const updatedRootItems = items.map((item, index) => ({
            ...item,
            order: index
        }))

        // Fusionner avec les autres items (non-racine)
        const allUpdatedItems = [...updatedRootItems, ...otherItems]

        // Mise à jour locale pour un retour immédiat
        const updatedMenu = { ...selectedMenu, items: allUpdatedItems }
        setSelectedMenu(updatedMenu)
        setMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m))

        // Sauvegarde sur le serveur
        const payload = updatedRootItems.map(item => ({ id: item.id, order: item.order }))
        await updateMenuOrder(payload)
        router.refresh()
    }

    const renderMenuItem = (item: MenuItem, index: number, level = 0) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems.has(item.id)

        return (
            <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-2"
                    >
                        <div
                            className={`flex items-center gap-3 p-4 bg-white border rounded-xl hover:border-gray-300 transition-all ${!item.isActive ? 'opacity-50' : ''} ${snapshot.isDragging ? 'shadow-2xl border-black z-50 ring-2 ring-black/5' : 'border-gray-200 shadow-sm'}`}
                            style={{
                                marginLeft: `${level * 24}px`,
                                ...provided.draggableProps.style
                            }}
                        >
                            <div {...provided.dragHandleProps} className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            {hasChildren && (
                                <button onClick={() => toggleExpand(item.id)} className="text-gray-400 hover:text-gray-600">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                            )}

                            <div className="flex-1">
                                <div className="font-bold text-gray-900">{item.label}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mt-1">
                                    <ExternalLink className="w-3 h-3" />
                                    {item.url}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleActive(item)}
                                    className={`p-2 rounded-lg transition-colors ${item.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>

                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {hasChildren && isExpanded && (
                            <div className="mt-2 pl-6">
                                {item.children!.map((child, idx) => (
                                    <div key={child.id}>
                                        {/* Recursive render but without Draggable for simplicity at nested levels for now */}
                                        <div className={`flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg mb-2 ${!child.isActive ? 'opacity-50' : ''}`}>
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm text-gray-900">{child.label}</div>
                                                <div className="text-[9px] font-black uppercase text-gray-400">{child.url}</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleToggleActive(child)} className="p-1.5 text-gray-400 hover:text-gray-600"><Eye className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeleteItem(child.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Draggable>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Liste des menus */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Menus</h2>
                        <button
                            onClick={() => setShowNewMenuForm(!showNewMenuForm)}
                            className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {showNewMenuForm && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <input
                                type="text"
                                placeholder="Nom (ex: header)"
                                value={newMenuData.name}
                                onChange={(e) => setNewMenuData({ ...newMenuData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Label (ex: Menu Principal)"
                                value={newMenuData.label}
                                onChange={(e) => setNewMenuData({ ...newMenuData, label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                            <button
                                onClick={handleCreateMenu}
                                className="w-full px-4 py-2 bg-black text-white rounded-lg text-sm font-black uppercase tracking-widest hover:bg-gray-800"
                            >
                                Créer
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {menus.map(menu => (
                            <div
                                key={menu.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedMenu?.id === menu.id ? 'bg-black text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`}
                                onClick={() => setSelectedMenu(menu)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-black text-[11px] uppercase tracking-wider">{menu.label}</div>
                                    {!menu.isActive && (
                                        <div className="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-100 text-red-600 uppercase tracking-wider">
                                            OFF
                                        </div>
                                    )}
                                </div>
                                <div className={`text-[10px] mt-1 font-bold ${selectedMenu?.id === menu.id ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {menu.items.length} éléments
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Éditeur de menu */}
            <div className="lg:col-span-3">
                {selectedMenu ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{selectedMenu.label}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                    Identifiant: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{selectedMenu.name}</code>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggleMenu(selectedMenu)}
                                    className={`p-2.5 rounded-xl transition-colors ${selectedMenu.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {selectedMenu.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => setShowNewItemForm(!showNewItemForm)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter
                                </button>
                                <button
                                    onClick={() => handleDeleteMenu(selectedMenu.id)}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>

                        {showNewItemForm && (
                            <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Nouvel élément de menu</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Label</label>
                                        <input
                                            type="text"
                                            placeholder="ex: Accueil"
                                            value={newItemData.label}
                                            onChange={(e) => setNewItemData({ ...newItemData, label: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">URL</label>
                                        <input
                                            type="text"
                                            placeholder="ex: /"
                                            value={newItemData.url}
                                            onChange={(e) => setNewItemData({ ...newItemData, url: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Élément Parent</label>
                                    <select
                                        value={newItemData.parentId}
                                        onChange={(e) => setNewItemData({ ...newItemData, parentId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                    >
                                        <option value="">(Aucun - Élément racine)</option>
                                        {selectedMenu.items.filter(item => !item.parentId).map(item => (
                                            <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleCreateItem}
                                        className="px-8 py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all"
                                    >
                                        Créer l'élément
                                    </button>
                                    <button
                                        onClick={() => setShowNewItemForm(false)}
                                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="menu-items">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-1"
                                    >
                                        {selectedMenu.items
                                            .filter(item => !item.parentId)
                                            .sort((a, b) => a.order - b.order) // Ensure consistent sort
                                            .map((item, index) => renderMenuItem(item, index))
                                        }
                                        {provided.placeholder}

                                        {selectedMenu.items.filter(item => !item.parentId).length === 0 && (
                                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <Plus className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="font-black text-xs uppercase tracking-widest text-gray-400">Aucun élément dans ce menu</p>
                                                <button
                                                    onClick={() => setShowNewItemForm(true)}
                                                    className="mt-4 text-xs font-black text-black underline underline-offset-4"
                                                >
                                                    Ajouter le premier élément
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Sélectionnez un menu pour commencer l'édition</p>
                    </div>
                )}
            </div>
        </div>
    )
}
