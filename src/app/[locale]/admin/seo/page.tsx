import { verifyAdmin } from '@/lib/actions/auth'
import { getSetting, getSettingsByCategory } from '@/lib/actions/site-settings'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SeoConfigForm from './SeoConfigForm'
import ImageInjectorForm from './ImageInjectorForm'
import ImageInjectorMetaForm from './ImageInjectorMetaForm'
import { Search, Image as ImageIcon, Zap, Code } from 'lucide-react'

export const metadata = {
    title: 'SEO Expert | Admin Riwaya',
}

export default async function SeoConfigPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    try {
        await verifyAdmin()
    } catch {
        redirect('/login')
    }

    const sp = await searchParams
    const activeTab = sp?.tab === 'head' ? 'head' : sp?.tab === 'images' ? 'images' : 'general'

    const [seoSettings, injectedTags] = await Promise.all([
        getSettingsByCategory('seo'),
        getSetting('seo_injected_head_tags'),
    ])

    // Livres pour l'onglet Image Injector Tools
    let books: any[] = []
    if (activeTab === 'images') {
        books = await prisma.book.findMany({
            where: { active: true },
            orderBy: { title: 'asc' },
            select: { id: true, title: true, author: true, image: true, category: true, imageAlt: true, imageTitle: true }
        })
    }

    const tabs = [
        { key: 'general', label: 'SEO Expert', icon: Zap },
        { key: 'head', label: 'Inject Head', icon: Code },
        { key: 'images', label: 'Image Injector Tools', icon: ImageIcon },
    ]

    return (
        <div className="space-y-12">
            {/* Header section style Riwaya */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Expert SEO<span className="text-emerald-500">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Optimisation tactique & Visibilité organique
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-[2.5rem] w-fit shadow-inner">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <a
                                key={tab.key}
                                href={`?tab=${tab.key}`}
                                className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeTab === tab.key
                                    ? 'bg-white text-black shadow-xl shadow-black/5 border border-white'
                                    : 'text-gray-400 hover:text-black'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </a>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 p-12">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'head' ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                                    <Code className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-black tracking-tight">Injection de Code <span className="text-blue-600">&lt;head&gt;</span></h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Pixels, Scripts & Tags personnalisés</p>
                                </div>
                            </div>
                            <ImageInjectorForm initialInjectedTags={injectedTags || ''} />
                        </div>
                    ) : activeTab === 'images' ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-black tracking-tight">Image Meta <span className="text-emerald-600">Optimizer</span></h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Édition en masse des balises ALT & TITLE</p>
                                </div>
                            </div>
                            <ImageInjectorMetaForm books={books.map(b => ({
                                ...b,
                                altText: b.imageAlt,
                                imageTitle: b.imageTitle
                            }))} />
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-black tracking-tight">Configuration <span className="text-emerald-600">SEO</span></h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Meta-titres, descriptions & sitemap</p>
                                </div>
                            </div>
                            <SeoConfigForm initialData={seoSettings} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
