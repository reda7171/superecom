import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BookOpen, Target, Heart, Award, ShieldCheck, Truck, Clock, Headphones, Quote, Sparkles } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-pixio-cream">
            <Header />

            {/* Hero Section */}
            <section className="relative py-32 bg-pixio-beige overflow-hidden text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-6xl md:text-8xl font-black text-black mb-8 tracking-tighter">Riwaya Studio<span className="text-gray-300">.</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 max-w-xl mx-auto leading-loose">
                        Your premium sanctuary for intellectual growth and professional evolution through curated literature.
                    </p>
                </div>
            </section>

            {/* Inspirational Quote Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <Quote className="w-16 h-16 text-pixio-cream mx-auto mb-10 opacity-50" />
                    <p className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tighter mb-10 italic">
                        "Un livre est un outil de liberté. Le lire, c'est s'ouvrir à un monde de possibilités infinies."
                    </p>
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-pixio-cream rounded-full">
                        <Sparkles className="w-4 h-4 text-black" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">
                            Riwaya Philosophy
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div className="space-y-10">
                            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-sm">
                                <Target className="w-4 h-4" />
                                <span>Our Purpose</span>
                            </div>
                            <h2 className="text-5xl font-black text-black leading-none tracking-tighter">Sparking Change<br />Through Wisdom.</h2>
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-loose">
                                At Riwaya, we believe the right volume at the right moment can fundamentally pivot a life trajectory. Our mission is to democratize access to global masterpieces in self-growth, business, and cognitive optimization.
                            </p>
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-loose">
                                We meticulously curate every select, focusing on practical implementation and positive velocity for your daily routines.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-beige rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <Heart className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Passion</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Universal love for knowledge.</p>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-pink rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <Award className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Quality</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Global standards selection.</p>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-yellow rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <ShieldCheck className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Trust</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Secure local deliveries.</p>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6 group hover:-translate-y-2 transition-transform">
                                <div className="w-16 h-16 bg-pixio-beige rounded-[1.5rem] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    <Truck className="w-7 h-7 text-black" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Proximity</h3>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Fast kingdom-wide ship.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-black tracking-tighter mb-4">Why Selects Riwaya?</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Excellence service for your personal archive.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="p-12 rounded-[3rem] bg-pixio-cream border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-500 group">
                            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 transform -rotate-6 group-hover:rotate-0 transition-transform">
                                <Clock className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">Live Stock</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">All online volumes are held in our local archives, ready for immediate dispatch.</p>
                        </div>
                        <div className="p-12 rounded-[3rem] bg-pixio-cream border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-500 group">
                            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 transform rotate-3 group-hover:rotate-0 transition-transform">
                                <Headphones className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">Expert Help</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Our curators are always online to guide your reading choices or track collections.</p>
                        </div>
                        <div className="p-12 rounded-[3rem] bg-pixio-cream border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-500 group">
                            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 transform -rotate-1 group-hover:rotate-0 transition-transform">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6">Safe Arrival</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Order with absolute peace. Only pay once the volumes are physically in your hands.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 bg-black text-white text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-none">Join the Adventure<span className="text-pixio-pink">.</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-16 max-w-xl mx-auto leading-loose">
                        Start today to architect the library of your intellectual dreams.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a href="/books" className="px-14 py-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-pixio-cream transition-all shadow-2xl">
                            Select Library
                        </a>
                        <a href="/packs" className="px-14 py-8 bg-black border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:border-white transition-all">
                            View Bundles
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
