import { getCommunityUser, logout, checkExchangeEligibility } from '@/lib/actions/community-auth'
import { redirect } from 'next/navigation'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Plus, BookOpen, Star, MapPin, Coins, Settings, LogOut, RefreshCw, Instagram, Facebook, Twitter } from 'lucide-react'
import { getWishlist } from '@/lib/actions/community-wishlist'
import WishlistSection from '@/components/community/WishlistSection'

export default async function CommunityDashboard() {
    const user = await getCommunityUser()

    if (!user) {
        redirect('/community/login')
    }

    const [t, wishlist, isEligible] = await Promise.all([
        getTranslations('Community'),
        getWishlist(),
        checkExchangeEligibility(user)
    ])

    async function handleLogout() {
        'use server'
        await logout()
        redirect('/')
    }

    const u = user as any

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 flex-grow w-full">
                {/* Eligibility Notice */}
                {!isEligible && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                            <RefreshCw className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-amber-900 font-black text-sm uppercase tracking-tight">{t('Dashboard.RestrictedAccess')}</h3>
                            <p className="text-amber-700 text-xs font-bold leading-relaxed">
                                {t('Dashboard.EligibilityDesc')}
                                <Link href="/" className="ml-2 underline hover:text-amber-900">{t('Dashboard.BrowseShop')} →</Link>
                            </p>
                        </div>
                    </div>
                )}
                {/* Profile Header */}
                <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-xl shadow-black/5 border border-gray-100 mb-12 flex flex-col md:flex-row gap-10 items-center md:justify-between relative overflow-hidden">
                    <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                        <div className="w-24 h-24 bg-pixio-yellow rounded-full flex items-center justify-center text-3xl font-black text-black uppercase shadow-lg transform rotate-3 border-4 border-white overflow-hidden flex-shrink-0">
                            {u.image ? (
                                <img src={u.image} alt={u.fullName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                u.fullName?.[0] || 'U'
                            )}
                        </div>
                        <div className="space-y-2 text-center md:text-left min-w-0">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tighter capitalize truncate">{u.fullName}</h1>
                                <Link
                                    href="/community/profile/edit"
                                    className="w-10 h-10 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                                    title={t('Dashboard.EditProfile')}
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 font-bold text-sm justify-center md:justify-start">
                                <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full"><MapPin className="w-3 h-3" /> {u.city}</span>
                                <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full"><Star className="w-3 h-3 fill-yellow-500" /> {u.rating?.toFixed(1) || 'N/A'}</span>
                            </div>

                            {(u.instagram || u.facebook || u.twitter) && (
                                <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
                                    {u.instagram && (
                                        <a href={`https://instagram.com/${u.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bg-gray-50 p-2 rounded-full hover:bg-black hover:text-white transition-colors">
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    )}
                                    {u.facebook && (
                                        <a href={`https://facebook.com/${u.facebook}`} target="_blank" rel="noopener noreferrer" className="bg-gray-50 p-2 rounded-full hover:bg-black hover:text-white transition-colors">
                                            <Facebook className="w-4 h-4" />
                                        </a>
                                    )}
                                    {u.twitter && (
                                        <a href={`https://twitter.com/${u.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bg-gray-50 p-2 rounded-full hover:bg-black hover:text-white transition-colors">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {u.bio && (
                                <p className="text-gray-500 text-sm mt-4 max-w-md text-center md:text-left border-l-2 border-gray-100 pl-4 italic line-clamp-2">
                                    {u.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 z-10">
                        <div className="bg-black text-white px-8 py-4 rounded-3xl flex flex-col items-center min-w-[120px] shadow-lg">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('Credits')}</span>
                            <div className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-pixio-yellow" />
                                <span className="text-3xl font-black tracking-tighter">{u.credits}</span>
                            </div>
                        </div>
                        <Link href="/community/exchanges" className="bg-white border-2 border-gray-100 px-8 py-4 rounded-3xl flex flex-col items-center min-w-[120px] hover:border-black transition-all group hover:shadow-lg text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-hover:text-black transition-colors">{t('ExchangesLabel')}</span>
                            <span className="text-3xl font-black text-black tracking-tighter group-hover:scale-110 transition-transform">
                                {/* TODO: Get real count if needed */}
                                -
                            </span>
                        </Link>
                    </div>

                    {/* Logout Button (Absolute Top Right) */}
                    <form action={handleLogout} className="absolute top-6 right-6 z-20">
                        <button
                            type="submit"
                            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4" /> {t('Dashboard.Logout')}
                        </button>
                    </form>
                </div>

                {/* Wishlist Section */}
                <WishlistSection wishlist={wishlist} />

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Link href="/community/market" className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-black transition-all group hover:shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-black group-hover:bg-gray-800 rounded-2xl flex items-center justify-center transition-colors">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black group-hover:text-amber-600 transition-colors">{t('Dashboard.ExploreMarketTitle')}</h3>
                                <p className="text-xs font-bold text-gray-400">{t('Dashboard.ExploreMarketDesc')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">{t('Dashboard.ExploreMarketLong')}</p>
                    </Link>

                    <Link href="/community/exchanges" className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-black transition-all group hover:shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gray-100 group-hover:bg-black rounded-2xl flex items-center justify-center transition-colors">
                                <RefreshCw className="w-7 h-7 text-black group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black group-hover:text-amber-600 transition-colors">{t('Dashboard.ManageExchangesTitle')}</h3>
                                <p className="text-xs font-bold text-gray-400">{t('Dashboard.ManageExchangesDesc')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">{t('Dashboard.ManageExchangesLong')}</p>
                    </Link>
                </div>

                {/* My Books Content */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-black uppercase tracking-normal flex items-center gap-3">
                        <BookOpen className="w-6 h-6" /> {t('MyBooks')}
                    </h2>
                    <Link href="/community/books/new" className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 group">
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> {t('AddBook')}
                    </Link>
                </div>

                {u.ownedBooks && u.ownedBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {u.ownedBooks.map((book: any) => (
                            <div key={book.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all hover:-translate-y-1">
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {t(`BookForm.Status.${book.status}` as any)}
                                    </span>
                                </div>

                                <div className="aspect-[2/3] bg-gray-50 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                                    {book.image ? (
                                        <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <BookOpen className="w-8 h-8 opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-black text-lg text-black leading-tight mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">{book.title}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 line-clamp-1">{book.author}</p>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                    <Link href={`/community/books/${book.id}`} className="flex-1 bg-black text-white hover:bg-gray-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-colors shadow-lg">
                                        {t('Dashboard.ManageBook')}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center border-dashed border-2 border-gray-200 hover:border-black transition-colors group">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">{t('Dashboard.EmptyLibraryTitle')}</h3>
                        <p className="text-gray-400 mb-8 max-w-sm mx-auto">{t('Dashboard.EmptyLibraryDesc')}</p>
                        <Link href="/community/books/new" className="inline-flex bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <Plus className="w-4 h-4" /> {t('Dashboard.StartAdding')}
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
