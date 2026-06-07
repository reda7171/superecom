import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, FileText, Download, Star, Eye } from 'lucide-react'
import DigitalProductsTable from './DigitalProductsTable'

export default async function DigitalProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const searchQuery = params.search || ''
  const ITEMS_PER_PAGE = 20

  const where: any = searchQuery
    ? {
        OR: [
          { title: { contains: searchQuery } },
          { author: { contains: searchQuery } },
        ],
      }
    : {}

  const [total, products, stats] = await Promise.all([
    prisma.digitalProduct.count({ where }),
    prisma.digitalProduct.findMany({
      where,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.digitalProduct.aggregate({
      _count: { id: true },
      _sum: { downloadCount: true },
    }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const activeCount = await prisma.digitalProduct.count({ where: { active: true } })
  const featuredCount = await prisma.digitalProduct.count({ where: { featured: true } })

    return (
        <div className="space-y-12">
            {/* Header section style SuperEcom */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter mb-2 italic">
                        Digital<span className="text-amber-500">.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        eBooks, PDFs & Ressources Numériques
                    </p>
                </div>
                
                <Link
                    href="/admin/digital-products/new"
                    className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un eBook
                </Link>
            </div>

            {/* Stats Grid Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Produits", value: total, color: "text-gray-400", icon: FileText },
                    { label: "Actifs", value: activeCount, color: "text-emerald-500", icon: Eye },
                    { label: "En vedette", value: featuredCount, color: "text-amber-500", icon: Star },
                    { label: "Téléchargements", value: stats._sum.downloadCount || 0, color: "text-blue-500", icon: Download }
                ].map((stat, i) => (
                    <div key={i} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-black/5 hover:-translate-y-1 transition-all relative overflow-hidden">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${stat.color}`}>{stat.label}</p>
                        <p className="text-4xl font-black text-black tracking-tighter">{stat.value}</p>
                        <stat.icon className={`absolute top-8 right-8 w-8 h-8 opacity-5 transition-transform group-hover:scale-125 ${stat.color}`} />
                    </div>
                ))}
            </div>

            {/* Table Container Premium */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <DigitalProductsTable
                    products={products}
                    pageNumber={currentPage}
                    totalPages={totalPages}
                    initialSearch={searchQuery}
                />
            </div>
        </div>
    )
}
