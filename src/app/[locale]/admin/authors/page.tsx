import { getAllAuthors } from '@/lib/actions/admin-authors'
import AuthorsList from './AuthorsList'
import { User, Sparkles, BookOpen } from 'lucide-react'

export default async function AdminAuthorsPage() {
    const { data: authors } = await getAllAuthors()

    // Calculer quelques stats
    const totalAuthors = authors?.length || 0
    const completedProfiles = authors?.filter(a => a.hasProfile).length || 0
    const totalBooksByAuthors = authors?.reduce((acc, curr) => acc + curr.bookCount, 0) || 0

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-black tracking-tighter">
                    Gestion des Auteurs<span className="text-gray-200">.</span>
                </h1>
                <p className="mt-2 text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose">
                    Personnalisez les biographies et images des auteurs de votre catalogue.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <User className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Total Auteurs</p>
                        <p className="text-4xl font-black text-black">{totalAuthors}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-20 h-20 text-pixio-yellow fill-pixio-yellow" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Profils Complétés</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-black text-black">{completedProfiles}</p>
                            <span className="text-xs font-bold text-gray-300">/ {totalAuthors}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <BookOpen className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Volume Catalogue</p>
                        <p className="text-4xl font-black text-black">{totalBooksByAuthors} <span className="text-xs font-bold text-gray-300">Livres</span></p>
                    </div>
                </div>
            </div>

            {/* Interactive List */}
            <AuthorsList initialAuthors={authors || []} />
        </div>
    )
}
