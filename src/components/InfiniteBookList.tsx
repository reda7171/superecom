'use client'

import React, { useState, useEffect, useRef } from 'react'
import { BookFilters } from '@/lib/db/books'
import { fetchBooks } from '@/lib/actions/books'
import BookCard from '@/components/BookCard'
import AdBanner from '@/components/AdBanner'
import { Book } from '@prisma/client'

interface InfiniteBookListProps {
    initialBooks: Book[]
    initialFilters: BookFilters
    adsense?: {
        enabled: boolean
        publisherId: string
        slotId: string
    }
}

export default function InfiniteBookList({ initialBooks, initialFilters, adsense }: InfiniteBookListProps) {
    const [books, setBooks] = useState<Book[]>(initialBooks)
    const [page, setPage] = useState(2)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const observerTarget = useRef<HTMLDivElement>(null)

    // Reset state when initialBooks changes (filtering)
    useEffect(() => {
        setBooks(initialBooks)
        setPage(2)
        setHasMore(initialBooks.length >= (initialFilters.limit || 12))
    }, [initialBooks, initialFilters])

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setLoading(true)
                    try {
                        const nextFilters = { ...initialFilters, page: page, limit: initialFilters.limit || 12 }
                        const result = await fetchBooks(nextFilters)

                        if (result.success && result.data) {
                            if (result.data.length < (initialFilters.limit || 12)) {
                                setHasMore(false)
                            }
                            // Avoid duplicates just in case
                            setBooks(prev => {
                                const newBooks = result.data.filter((newBook: Book) => !prev.some(b => b.id === newBook.id))
                                return [...prev, ...newBooks]
                            })
                            setPage(prev => prev + 1)
                        } else {
                            setHasMore(false)
                        }
                    } catch (e) {
                        console.error(e)
                        setHasMore(false)
                    } finally {
                        setLoading(false)
                    }
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [hasMore, loading, page, initialFilters])

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {books.map((book, index) => {
                    // Afficher une pub tous les 8 livres (après la 2ème ligne sur desktop)
                    const showAd = adsense?.enabled && adsense?.publisherId && adsense?.slotId && index > 0 && index % 8 === 0

                    return (
                        <React.Fragment key={book.id}>
                            {showAd && (
                                <div className="col-span-2 md:col-span-3 xl:col-span-4 py-4">
                                    <AdBanner publisherId={adsense.publisherId} slotId={adsense.slotId} />
                                </div>
                            )}
                            <BookCard {...book} />
                        </React.Fragment>
                    )
                })}
            </div>

            {hasMore && (
                <div ref={observerTarget} className="mt-10">
                    {loading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100/50 shadow-sm h-full flex flex-col p-4 animate-pulse lg:animate-none">
                                    <div className="aspect-square bg-gray-100 rounded-[1.5rem] mb-6"></div>
                                    <div className="space-y-3 px-2">
                                        <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto"></div>
                                        <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto"></div>
                                        <div className="h-8 bg-gray-100 rounded-full w-full mt-4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!hasMore && books.length > 0 && (
                <div className="text-center p-10 text-gray-400 text-xs font-black uppercase tracking-widest">
                    Fin de la collection
                </div>
            )}
        </>
    )
}
