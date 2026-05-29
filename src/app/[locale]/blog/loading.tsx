import Header from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { Quote } from 'lucide-react'

export default function BlogLoading() {
    return (
        <div className="min-h-screen bg-pixio-cream font-sans">
            <Header />

            {/* Hero Section Skeleton */}
            <div className="bg-pixio-beige pt-20 pb-20 relative overflow-hidden">
                <Quote className="absolute -top-10 -right-10 w-64 h-64 text-pixio-cream opacity-50 -rotate-12" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
                    <div className="w-32 h-8 bg-black/5 rounded-full mb-6 animate-pulse" />
                    <div className="w-3/4 max-w-3xl h-20 bg-black/5 rounded-3xl mb-6 animate-pulse" />
                    <div className="w-1/2 max-w-xl h-6 bg-black/5 rounded-full animate-pulse" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3, 4, 5, 6].map((i, idx) => (
                        <div 
                            key={i}
                            className={`group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 flex flex-col animate-pulse ${idx === 0 ? 'md:col-span-2 lg:col-span-3 lg:flex-row lg:h-[500px]' : 'h-full'}`}
                        >
                            {/* Image Skeleton */}
                            <div className={`relative bg-gray-100 ${idx === 0 ? 'w-full lg:w-1/2 h-64 lg:h-full' : 'aspect-[4/3]'}`} />

                            {/* Content Skeleton */}
                            <div className={`flex flex-col justify-center p-8 ${idx === 0 ? 'lg:w-1/2 lg:p-12' : ''}`}>
                                <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-4 bg-gray-100 rounded-full" />
                                    <div className="w-20 h-4 bg-gray-100 rounded-full" />
                                </div>
                                <div className="w-full h-8 bg-gray-100 rounded-xl mb-4" />
                                <div className="w-2/3 h-8 bg-gray-100 rounded-xl mb-8" />
                                <div className="w-full h-4 bg-gray-50 rounded-full mb-2" />
                                <div className="w-4/5 h-4 bg-gray-50 rounded-full mb-8" />
                                <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between">
                                    <div className="w-24 h-4 bg-gray-100 rounded-full" />
                                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <Footer />
        </div>
    )
}
