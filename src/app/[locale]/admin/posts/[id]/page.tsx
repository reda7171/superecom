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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Modifier l'article</h1>
                <p className="text-sm text-gray-500">Mettez à jour le contenu de votre article</p>
            </div>

            <PostForm post={post} isEditing />
        </div>
    )
}
