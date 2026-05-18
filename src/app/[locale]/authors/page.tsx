import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAuthorsData } from '@/lib/db/authors'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import AuthorsListClient from '@/components/authors/AuthorsListClient'
import { Users, Sparkles } from 'lucide-react'
import ScrollReveal from '@/components/ScrollReveal'
import { Link } from '@/i18n/routing'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('AuthorsPage')
    
    return {
        title: t('Title'),
        description: t('Subheading'),
        alternates: {
            canonical: `/${locale}/authors`
        }
    }
}

export default async function AuthorsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations('AuthorsPage')
    const authors = await getAuthorsData()

    // Top authors (most books or with bio)
    const featuredAuthors = authors.filter(a => a.bio || a.bookCount > 5).slice(0, 4)

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-pixio-cream">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pixio-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pixio-pink/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-float-slow"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <ScrollReveal animation="animate-reveal-up">
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                                    <Users className="w-4 h-4 text-pixio-yellow" />
                                    <span>{t('AllAuthors')}</span>
                                </div>
                            </ScrollReveal>
                            
                            <ScrollReveal animation="animate-reveal-up" delay={200}>
                                <h1 className="text-5xl md:text-8xl font-black text-black leading-tight tracking-tighter">
                                    {t('Heading')}<span className="text-pixio-pink">.</span>
                                </h1>
                            </ScrollReveal>

                            <ScrollReveal animation="animate-reveal-up" delay={400}>
                                <p className="text-xl text-gray-500 font-medium max-w-2xl tracking-tight">
                                    {t('Subheading')}
                                </p>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Featured Section (Optional but nice) */}
                {featuredAuthors.length > 0 && (
                    <section className="py-20 border-b border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-pixio-yellow rounded-2xl">
                                    <Sparkles className="w-6 h-6 text-black" />
                                </div>
                                <h2 className="text-2xl font-black text-black uppercase tracking-widest">{t('Featured')}</h2>
                                <div className="h-px flex-grow bg-gray-100"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {featuredAuthors.map((author, idx) => (
                                    <ScrollReveal key={author.name} delay={idx * 100} animation="animate-reveal-up">
                                        <div className="group relative bg-white p-8 rounded-[3rem] border border-gray-50 hover:border-black transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                            <div className="flex flex-col items-center text-center">
                                                <Link 
                                                    href={`/authors/${encodeURIComponent(author.name)}`}
                                                    className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-6 border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-500 block cursor-pointer"
                                                >
                                                    {(author.image || author.sampleBookImage) ? (
                                                        <img 
                                                            src={author.image || author.sampleBookImage!} 
                                                            alt={author.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Users className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <h3 className="text-xl font-black text-black mb-2 line-clamp-1">{author.name}</h3>
                                                <p className="text-xs font-black text-pixio-pink uppercase tracking-widest mb-4">
                                                    {t('BooksCount', { count: author.bookCount })}
                                                </p>
                                                {author.bio && (
                                                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 italic">
                                                        "{author.bio}"
                                                    </p>
                                                )}
                                                <Link 
                                                    href={`/authors/${encodeURIComponent(author.name)}`}
                                                    className="px-6 py-3 bg-pixio-cream text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all border border-transparent hover:border-black"
                                                >
                                                    {t('ViewBooks')}
                                                </Link>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* All Authors List */}
                <AuthorsListClient 
                    authors={authors} 
                    locale={locale}
                />
            </main>
            <Footer />
        </>
    )
}
