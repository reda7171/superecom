import PostForm from '@/components/admin/PostForm'

export default function NewPostPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Nouvel Article</h1>
                <p className="text-sm text-gray-500">Rédigez un nouvel article pour le blog</p>
            </div>

            <PostForm />
        </div>
    )
}
