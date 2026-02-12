export default function BookSelectionSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm animate-pulse">
                    {/* Image skeleton */}
                    <div className="aspect-[2/3] bg-gray-200 rounded-2xl mb-4 shadow-inner" />

                    {/* Title skeleton */}
                    <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2" />

                    {/* Author skeleton */}
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-6" />

                    {/* Owner skeleton */}
                    <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div className="space-y-2 flex-grow">
                            <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
                            <div className="h-2 bg-gray-100 rounded-lg w-1/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
