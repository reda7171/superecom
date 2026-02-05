import { getPackById } from '@/lib/db/packs'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookCard from '@/components/BookCard'
import AddToCartButton from '@/components/AddToCartButton'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Check, Package, Shield, Sparkles, Truck } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function PackDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const pack = await getPackById(id)

    if (!pack) {
        notFound()
    }

    const totalOriginalPrice = pack.books.reduce((sum, pb) => sum + pb.book.price, 0)
    const savings = totalOriginalPrice - pack.price
    const savingsPercent = Math.round((savings / totalOriginalPrice) * 100)

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-12">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <span className="text-gray-200">/</span>
                    <Link href="/packs" className="hover:text-black transition-colors">Bundles</Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-black">{pack.name}</span>
                </div>

                <Link
                    href="/packs"
                    className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-12 group transition-colors"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to bundles</span>
                </Link>

                {/* Hero Pack */}
                <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 mb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Section */}
                        <div className="bg-pixio-beige p-12 flex items-center justify-center relative min-h-[500px]">
                            <div className="absolute top-10 right-10 z-10">
                                <div className="bg-black text-white px-8 py-8 rounded-[2rem] shadow-2xl transform rotate-6 flex flex-col items-center justify-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Save</p>
                                    <p className="text-4xl font-black leading-none tracking-tighter">{savingsPercent}%</p>
                                </div>
                            </div>

                            {pack.image ? (
                                <div className="relative w-full h-full min-h-[400px] group">
                                    <Image
                                        src={pack.image}
                                        alt={pack.name}
                                        fill
                                        className="object-contain transition-transform duration-700 group-hover:scale-105"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                                    {pack.books.slice(0, 4).map((pb, i) => (
                                        <div key={pb.book.id} className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105 transform ${i % 2 === 0 ? '-rotate-3 mt-6' : 'rotate-3 mb-6'}`}>
                                            <Image
                                                src={pb.book.image}
                                                alt={pb.book.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-12 lg:p-20 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 w-fit">
                                <Package className="w-4 h-4" />
                                {pack.books.length} Volumes Selection
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-black leading-none tracking-tighter mb-10">
                                {pack.name}<span className="text-gray-200">.</span>
                            </h1>

                            {/* Price Block */}
                            <div className="bg-pixio-cream/50 rounded-[2.5rem] p-10 mb-12 border border-gray-50">
                                <div className="flex items-center gap-6 mb-4">
                                    <span className="text-gray-300 text-xl line-through font-black tracking-tighter">
                                        {totalOriginalPrice} MAD
                                    </span>
                                    <span className="text-black font-black bg-pixio-yellow px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest">
                                        -{savings} MAD OFF
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-7xl font-black text-black tracking-tighter leading-none">{pack.price}</span>
                                    <span className="text-2xl text-gray-300 font-black uppercase tracking-widest">MAD</span>
                                </div>
                            </div>

                            <div className="mb-12">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-8 flex items-center gap-4">
                                    <Sparkles className="w-4 h-4 text-black" />
                                    Bundle Content
                                </h3>
                                <ul className="space-y-4">
                                    {pack.books.map((pb) => (
                                        <li key={pb.book.id} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">{pb.book.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <AddToCartButton
                                product={{
                                    id: pack.id,
                                    title: pack.name,
                                    price: pack.price,
                                    image: pack.image || pack.books[0]?.book.image || '',
                                    type: 'PACK'
                                }}
                                className="!py-8 text-xs font-black uppercase tracking-[0.3em] !rounded-full shadow-2xl hover:shadow-black/20"
                            />

                            <div className="flex items-center justify-center gap-10 mt-10">
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300">
                                    <Truck className="w-4 h-4" />
                                    Global Ship
                                </div>
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-300">
                                    <Shield className="w-4 h-4" />
                                    Secure COD
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Books Details */}
                <section>
                    <div className="flex items-center justify-between mb-20 px-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-black text-white rounded-[1.5rem] flex items-center justify-center text-4xl font-black tracking-tighter">
                                {pack.books.length}
                            </div>
                            <h2 className="text-4xl font-black text-black tracking-tighter leading-none">Volumes in this Collection<span className="text-gray-200">.</span></h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {pack.books.map((pb) => (
                            <BookCard key={pb.book.id} {...pb.book} />
                        ))}
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    )
}
