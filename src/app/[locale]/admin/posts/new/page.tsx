import PostForm from '@/components/admin/PostForm'

export default function NewPostPage() {
    return (
        <div className="space-y-10 max-w-7xl mx-auto py-8">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-[#0f0f0f] tracking-tight mb-3">Nouvel Article</h1>
                <p className="text-gray-500 font-medium text-lg">Rédigez un chef-d'œuvre avec l'éditeur premium</p>
            </div>

            <PostForm />
        </div>
    )
}
