import PostForm from '@/components/admin/PostForm'

export default function NewPostPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center md:text-left mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Nouvel Article</h1>
                <p className="text-gray-500 font-medium text-lg">Rédigez un chef-d'œuvre avec l'éditeur premium</p>
            </div>

            <PostForm />
        </div>
    )
}
