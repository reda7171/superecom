import PostForm from '@/components/admin/PostForm'
import { getPostById } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const post = await getPostById(id)

    if (!post) {
        notFound()
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto py-8">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-[#0f0f0f] tracking-tight mb-3">Modifier l'article</h1>
                <p className="text-gray-500 font-medium text-lg">Mettez à jour le contenu de votre article avec l'éditeur premium</p>
            </div>

            <PostForm post={post} isEditing />
        </div>
    )
}
