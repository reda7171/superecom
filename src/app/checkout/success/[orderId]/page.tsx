import { getOrderById } from '@/lib/actions/orders'
import Header from '@/components/Header'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package, Truck, Wallet, Ticket, Loader2, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'

export default async function OrderSuccessPage({
    params,
}: {
    params: Promise<{ orderId: string }>
}) {
    const { orderId } = await params
    const order = await getOrderById(orderId)

    if (!order) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-black/5 text-center relative overflow-hidden">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pixio-yellow/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-10 shadow-2xl">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-5xl font-black text-black mb-4 tracking-tighter">Order Confirmed<span className="text-gray-200">.</span></h1>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">
                            Thank you {order.fullName.split(' ')[0]}, your selection is being prepared.
                        </p>

                        <div className="w-full bg-pixio-cream/50 rounded-[2rem] p-8 md:p-10 mb-12 text-left border border-gray-100 flex flex-col gap-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Reference</p>
                                    <p className="text-xl font-black text-black tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Date</p>
                                    <p className="text-lg font-black text-black tracking-tight">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Total Paid (COD)</p>
                                <p className="text-4xl font-black text-black tracking-tighter">{order.total} <span className="text-[10px] uppercase font-black text-gray-400 ml-1">MAD</span></p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Next Steps</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Agent will call you within 24h for confirmation.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Prepare the exact amount for local collection.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-4 px-12 py-6 bg-black text-white font-black text-xs uppercase tracking-[0.3em] rounded-full hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20 group"
                        >
                            <span>Back home</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
