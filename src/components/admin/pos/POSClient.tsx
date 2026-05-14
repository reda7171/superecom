'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, ShoppingBag, Trash2, Plus, Minus, User, MapPin, Phone, Maximize, Minimize, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import POSProductCard from './POSProductCard';
import { createPOSOrder } from '@/lib/actions/pos';
import { useUIStore } from '@/store/ui';
import { getWithYouCities } from '@/lib/actions/delivery';
import { useEffect } from 'react';

interface Product {
  id: string;
  title?: string;
  name?: string;
  price: number;
  image: string | null;
  stock?: number;
}

interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  type: 'BOOK' | 'PACK';
}

interface POSClientProps {
  books: any[];
  packs: any[];
}

export default function POSClient({ books, packs }: POSClientProps) {
  const params = useParams();
  const locale = params.locale as string;
  const { showNotification } = useUIStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'BOOKS' | 'PACKS'>('ALL');
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: ''
  });
  const [shippingFees, setShippingFees] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [allCities, setAllCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCities, setShowCities] = useState(false);

  useEffect(() => {
    getWithYouCities().then(setAllCities);
  }, []);

  useEffect(() => {
    if (customer.city && customer.city.length > 0) {
      const filtered = allCities.filter(c => 
        c.toLowerCase().includes(customer.city.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 8));
      setShowCities(filtered.length > 0);
    } else {
      setFilteredCities([]);
      setShowCities(false);
    }
  }, [customer.city, allCities]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(console.error);
      }
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPacks = packs.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const displayedProducts = [
    ...(activeTab === 'ALL' || activeTab === 'BOOKS' ? filteredBooks.map(b => ({ ...b, type: 'BOOK' as const })) : []),
    ...(activeTab === 'ALL' || activeTab === 'PACKS' ? filteredPacks.map(p => ({ ...p, type: 'PACK' as const })) : [])
  ];

  const addToCart = (product: any, type: 'BOOK' | 'PACK') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.type === type);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === existing.cartItemId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, type, quantity: 1, cartItemId: Math.random().toString() }];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  // Modifier le prix d'un article dans le panier
  const updatePrice = (cartItemId: string, newPrice: number) => {
    setCart(prev => prev.map(item =>
      item.cartItemId === cartItemId ? { ...item, price: newPrice >= 0 ? newPrice : 0 } : item
    ));
  };

  const removeItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = itemsTotal + Number(shippingFees) - Number(discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return showNotification('Le panier est vide', 'error');
    if (!customer.fullName || !customer.phone) return showNotification('Veuillez remplir les informations client (Nom et Téléphone)', 'error');

    setIsSubmitting(true);
    try {
      const result = await createPOSOrder({
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address || 'Au magasin',
        city: customer.city || 'Non spécifiée',
        items: cart.map(c => ({
          id: c.id,
          type: c.type,
          quantity: c.quantity,
          price: c.price
        })),
        subtotal: itemsTotal,
        total: finalTotal,
        discount: Number(discount),
        shippingFees: Number(shippingFees)
      });

      if (result.success) {
        showNotification(`Commande créée avec succès: ${result.orderId}`, 'success');
        setCart([]);
        setCustomer({ fullName: '', phone: '', address: '', city: '' });
        setShippingFees(0);
        setDiscount(0);
      } else {
        showNotification(result.error || 'Erreur lors de la création', 'error');
      }
    } catch (error) {
      showNotification('Erreur inattendue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showMobileCart, setShowMobileCart] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 relative bg-gray-50/50 p-2 lg:p-4 overflow-hidden">
      {/* Main Content - Products */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden ${showMobileCart ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-8 md:p-10 border-b border-gray-50 space-y-8 bg-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center justify-between gap-6 w-full md:w-auto">
              <div>
                <h1 className="text-4xl lg:text-6xl font-black text-black tracking-tighter italic">Caisse<span className="text-emerald-500">.</span></h1>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">Point de vente physique & Événementiel</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleFullscreen}
                  className="hidden sm:flex w-12 h-12 items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all shadow-sm"
                  title={isFullscreen ? "Quitter" : "Plein écran"}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                {/* Bouton Panier Mobile Premium */}
                <button 
                  onClick={() => setShowMobileCart(true)}
                  className="lg:hidden relative w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/20"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <Search className="w-4 h-4 text-gray-300 absolute left-5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black" />
              <input
                type="text"
                placeholder="RECHERCHER UN PRODUIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all font-black text-[10px] uppercase tracking-widest shadow-inner"
              />
            </div>
          </div>
          
          {/* Categories Premium */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {[
                { id: 'ALL', label: 'TOUT LE CATALOGUE' },
                { id: 'BOOKS', label: 'LIVRES UNITAIRES' },
                { id: 'PACKS', label: 'PACKS PROMO' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                  activeTab === tab.id 
                    ? 'bg-black text-white border-black shadow-xl shadow-black/20 scale-105' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Premium */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto bg-gray-50/30 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {displayedProducts.map((product) => (
              <POSProductCard
                key={`${product.type}-${product.id}`}
                product={product}
                type={product.type}
                onAdd={addToCart}
              />
            ))}
          </div>
          {displayedProducts.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-32 text-gray-300">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 border border-gray-50">
                <Search className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart Premium */}
      <div className={`
        fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-[450px] flex flex-col bg-white lg:rounded-[3rem] shadow-2xl lg:shadow-xl border border-gray-100 overflow-y-auto custom-scrollbar shrink-0 transition-all duration-500 ease-in-out
        ${showMobileCart ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMobileCart(false)}
              className="lg:hidden w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all border border-gray-100 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight italic flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                Commande
              </h2>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Terminal de vente actif</p>
            </div>
          </div>
          <span className="bg-black text-white text-[9px] font-black px-4 py-2 rounded-full shadow-xl shadow-black/10 uppercase tracking-widest">
            {cart.length} ARTICLES
          </span>
        </div>

        {/* Cart Items Premium */}
        <div className="shrink-0 p-6 space-y-4 bg-white min-h-[300px]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-200 space-y-6">
              <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-12 h-12 opacity-20" strokeWidth={1} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Le panier est vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
                <div className="w-16 h-20 bg-white rounded-2xl border border-gray-100 overflow-hidden relative shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title || item.name} 
                      className="w-full h-full object-cover unoptimized"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-100" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-black text-[11px] uppercase tracking-tight line-clamp-1 italic">{item.title || item.name}</h4>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
                        <input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={e => updatePrice(item.cartItemId, Number(e.target.value))}
                            className="w-12 text-right bg-transparent text-[11px] font-black text-emerald-600 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase">DH</span>
                    </div>

                    <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <button onClick={() => updateQuantity(item.cartItemId, -1)} className="px-3 py-2 text-gray-300 hover:text-black transition-colors border-r border-gray-50">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-[11px] font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, 1)} className="px-3 py-2 text-gray-300 hover:text-black transition-colors border-l border-gray-50">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button onClick={() => removeItem(item.cartItemId)} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Information Form Premium */}
        <div className="shrink-0 p-8 border-t border-gray-50 bg-gray-50/50 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black text-black uppercase tracking-[0.2em]">
            <User className="w-3.5 h-3.5" /> Fiche Client
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="NOM COMPLET DU CLIENT *"
              value={customer.fullName}
              onChange={e => setCustomer({...customer, fullName: e.target.value})}
              className="w-full px-6 py-4 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm"
            />
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="tel"
                    placeholder="TÉLÉPHONE *"
                    value={customer.phone}
                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                    className="w-full px-6 py-4 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm"
                />
                <div className="relative">
                    <input
                        type="text"
                        placeholder="VILLE"
                        value={customer.city}
                        autoComplete="off"
                        onChange={e => setCustomer({...customer, city: e.target.value})}
                        onFocus={() => customer.city && filteredCities.length > 0 && setShowCities(true)}
                        className="w-full px-6 py-4 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm"
                    />
                    {showCities && (
                        <div className="absolute z-[999] left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar">
                            {filteredCities.map((city, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setCustomer({...customer, city});
                                        setShowCities(false);
                                    }}
                                    className="w-full px-6 py-3 text-left hover:bg-gray-50 font-black text-[9px] uppercase tracking-widest transition-colors border-b border-gray-50 last:border-none"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <input
                type="text"
                placeholder="ADRESSE DE LIVRAISON (SI NÉCESSAIRE)"
                value={customer.address}
                onChange={e => setCustomer({...customer, address: e.target.value})}
                className="w-full px-6 py-4 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Summary & Checkout Premium */}
        <div className="shrink-0 p-8 md:p-10 bg-white border-t border-gray-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Sous-total articles</span>
              <span className="text-black font-black">{itemsTotal.toFixed(0)} DH</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Frais de livraison</span>
              <div className="flex items-center gap-2">
                 <input
                  type="number"
                  value={shippingFees}
                  onChange={e => setShippingFees(Number(e.target.value))}
                  className="w-16 text-right px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black focus:border-black outline-none"
                />
                <span className="text-black">DH</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Remise exceptionnelle</span>
              <div className="flex items-center gap-2 text-red-500">
                <span className="font-black">-</span>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-16 text-right px-3 py-1.5 bg-red-50/50 border border-red-100 rounded-xl text-[10px] font-black text-red-600 focus:border-red-600 outline-none"
                />
                <span className="font-black">DH</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-100 border-dashed flex justify-between items-end">
              <div>
                <span className="text-gray-400 font-black text-[9px] uppercase tracking-[0.4em] block mb-1">Total Final</span>
                <span className="text-4xl md:text-5xl font-black text-black tracking-tighter italic">
                    {finalTotal.toFixed(0)}<span className="text-sm font-bold ml-1 text-emerald-500">DH</span>
                </span>
              </div>
              <ShoppingBag className="w-10 h-10 text-gray-50" />
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-6 bg-black text-white rounded-3xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-black/30 hover:bg-gray-900 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {isSubmitting ? 'Traitement en cours...' : 'VALIDER LA VENTE'}
          </button>
        </div>
      </div>
    </div>
  );
}
