import { prisma } from '@/lib/prisma'
import { Link } from '@/i18n/routing'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessagesSquare, ShoppingCart, User, Phone, Trash2, Mail } from 'lucide-react'

// Utilitaire pour formater le panier
function formatCartItems(cartDataStr: string) {
    try {
        const items = JSON.parse(cartDataStr)
        return items.map((i: any) => `${i.quantity}x ${i.title || 'Livre'}`).join(', ')
    } catch {
        return 'Erreur de lecture'
    }
}

export default async function AbandonedCartsPage() {
    // Récupérer les paniers abandonnés qui sont en attente (depuis plus de 10 minutes pour éviter le spam immédiat)
    // Ici on prendra tout ce qui est PENDING pour simuler, mais idéalement on filtre par date.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    const abandonedCarts = await prisma.abandonedCart.findMany({
        where: {
            status: 'PENDING',
            updatedAt: { lte: tenMinutesAgo }
        },
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Relances<span className="text-red-600">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Recouvrement des paniers abandonnés
                    </p>
                </div>
                
                <div className="px-8 py-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 shadow-sm">
                    <ShoppingCart className="w-4 h-4 text-red-600" />
                    <span className="font-black text-[11px] text-red-900 uppercase tracking-widest">
                        {abandonedCarts.length} Paniers à relancer
                    </span>
                </div>
            </div>

            <div className="grid gap-8">
                {abandonedCarts.map(cart => (
                    <div key={cart.id} className="group bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-black/5 flex flex-col lg:flex-row gap-10 lg:items-center justify-between hover:-translate-y-1 transition-all">
                        
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-black/10 shrink-0 transition-transform group-hover:scale-110">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-black tracking-tight uppercase italic">{cart.fullName || 'Client Inconnu'}</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Actif il y a {formatDistanceToNow(cart.updatedAt, { locale: fr })}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                {cart.phone && (
                                    <div className="flex items-center gap-3 border border-gray-50 px-5 py-3 rounded-2xl bg-gray-50 shadow-inner">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[11px] font-black text-black tracking-widest">{cart.phone}</span>
                                    </div>
                                )}
                                {cart.email && (
                                    <div className="flex items-center gap-3 border border-gray-50 px-5 py-3 rounded-2xl bg-gray-50 shadow-inner">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[11px] font-black text-black tracking-widest">{cart.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-red-50/30 p-8 rounded-[2.5rem] border border-red-50/50 shadow-inner relative overflow-hidden">
                            <h4 className="text-[9px] font-black uppercase text-red-900/40 mb-4 tracking-[0.2em]">Détail de la sélection</h4>
                            <p className="text-sm font-bold text-gray-700 leading-relaxed italic pr-12">
                                "{formatCartItems(cart.cartData)}"
                            </p>
                            <div className="mt-6 pt-6 border-t border-red-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-red-900/40 uppercase tracking-widest">Valeur Potentielle</span>
                                <span className="text-2xl font-black text-red-600 tracking-tighter">{cart.total} MAD</span>
                            </div>
                            <ShoppingCart className="absolute top-8 right-8 w-12 h-12 text-red-600/5 rotate-12" />
                        </div>

                        {/* Actions Premium */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
                            {cart.phone && (
                                <a 
                                    href={`https://wa.me/${cart.phone.replace(/^0/, '212').replace(/\s+/g, '')}?text=Bonjour ${cart.fullName || ''}, nous avons remarqué que vous n'avez pas terminé votre commande sur SuperEcom. Avez-vous besoin d'aide avec un livre ou le paiement à la livraison ?`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-all text-[10px] w-full"
                                >
                                    <MessagesSquare className="w-4 h-4" />
                                    Relance WhatsApp
                                </a>
                            )}
                            {cart.email && !cart.phone && (
                                <a 
                                    href={`mailto:${cart.email}?subject=Votre panier SuperEcom vous attend&body=Bonjour ${cart.fullName || ''}, ...`}
                                    className="flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all text-[10px] w-full"
                                >
                                    <Mail className="w-4 h-4" />
                                    Envoyer Email
                                </a>
                            )}
                            <form action={async () => {
                                'use server'
                                await prisma.abandonedCart.update({
                                    where: { id: cart.id },
                                    data: { status: 'LOST' }
                                })
                            }} className="w-full">
                                <button className="flex items-center justify-center gap-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-sm transition-all text-[10px] w-full">
                                    <Trash2 className="w-4 h-4" />
                                    Clôturer
                                </button>
                            </form>
                        </div>

                    </div>
                ))}

                {abandonedCarts.length === 0 && (
                    <div className="text-center py-32 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-8 border border-gray-50">
                            <ShoppingCart className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="font-black text-2xl text-black tracking-tight mb-3 uppercase italic">Aucun panier abandonné</h3>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Excellente performance de conversion</p>
                    </div>
                )}
            </div>
        </div>
    )
}
