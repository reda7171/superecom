'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCommunityUser } from './community-auth'
import { verifyAdmin } from './auth'

/**
 * Ajouter un commentaire sur un article
 */
export async function addComment(postId: string, content: string, authorName?: string) {
    try {
        const user = await getCommunityUser()
        
        await prisma.comment.create({
            data: {
                content,
                postId,
                userId: user?.id || null,
                authorName: user ? null : (authorName || 'Anonyme'),
                isApproved: false // Nécessite validation par défaut
            }
        })

        revalidatePath(`/blog/[slug]`, 'page')
        return { success: true, message: 'Votre commentaire est en attente de modération.' }
    } catch (error) {
        console.error('Error adding comment:', error)
        return { success: false, error: 'Erreur lors de l\'ajout du commentaire' }
    }
}

/**
 * Récupérer tous les commentaires (Admin)
 */
export async function getAllComments(page = 1, limit = 20) {
    try {
        await verifyAdmin()
        const skip = (page - 1) * limit

        const [comments, total] = await prisma.$transaction([
            prisma.comment.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    post: { select: { title: true, slug: true } },
                    user: { select: { fullName: true, email: true } }
                }
            }),
            prisma.comment.count()
        ])

        return {
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        return { comments: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } }
    }
}

/**
 * Approuver un commentaire
 */
export async function approveComment(id: string) {
    try {
        await verifyAdmin()
        const comment = await prisma.comment.update({
            where: { id },
            data: { isApproved: true },
            include: { post: { select: { slug: true } } }
        })

        revalidatePath(`/blog/${comment.post.slug}`)
        revalidatePath('/admin/comments')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de l\'approbation' }
    }
}

/**
 * Supprimer un commentaire
 */
export async function deleteComment(id: string) {
    try {
        await verifyAdmin()
        const comment = await prisma.comment.delete({
            where: { id },
            include: { post: { select: { slug: true } } }
        })

        revalidatePath(`/blog/${comment.post.slug}`)
        revalidatePath('/admin/comments')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}
