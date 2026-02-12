'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Public Actions

/**
 * Récupère les articles de blog publiés avec pagination
 */
export async function getPublishedPosts(page = 1, limit = 9) {
    const skip = (page - 1) * limit

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit,
            include: {
                author: {
                    select: {
                        fullName: true,
                        image: true
                    }
                }
            }
        }),
        prisma.post.count({ where: { published: true } })
    ])

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

/**
 * Récupère un article par son slug
 */
export async function getPostBySlug(slug: string) {
    return prisma.post.findUnique({
        where: { slug, published: true },
        include: {
            author: {
                select: {
                    fullName: true,
                    image: true,
                    bio: true
                }
            }
        }
    })
}

// Admin / Internal Actions (Simplified for now)

/**
 * Récupère les derniers articles pour la page d'accueil (optionnel)
 */
export async function getRecentPosts(limit = 3) {
    return prisma.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            author: {
                select: {
                    fullName: true
                }
            }
        }
    })
}

// ============================================
// ADMIN ACTIONS
// ============================================

export async function getAllPosts(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit
    const where: any = {}

    if (search) {
        where.title = { contains: search }
    }

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                author: {
                    select: { fullName: true }
                }
            }
        }),
        prisma.post.count({ where })
    ])

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

import { verifyAdmin, getAdminUser } from '@/lib/actions/auth'

export async function createPost(data: any) {
    try {
        await verifyAdmin()
        const adminId = await getAdminUser()

        if (!adminId) {
            return { success: false, error: 'Session invalide' }
        }

        // Ensure slug is unique
        const existing = await prisma.post.findUnique({
            where: { slug: data.slug }
        })

        if (existing) {
            return { success: false, error: 'Ce slug existe déjà' }
        }

        await prisma.post.create({
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                coverImage: data.coverImage,
                published: data.published,
                publishedAt: data.published ? new Date() : null,
                authorId: adminId
            }
        })

        revalidatePath('/blog')
        revalidatePath('/admin/posts')
        return { success: true }
    } catch (error) {
        console.error('Error creating post:', error)
        return { success: false, error: 'Erreur lors de la création' }
    }
}

export async function updatePost(id: string, data: any) {
    try {
        await verifyAdmin()

        await prisma.post.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                coverImage: data.coverImage,
                published: data.published,
                publishedAt: data.published ? (data.publishedAt || new Date()) : null,
            }
        })

        revalidatePath('/blog')
        revalidatePath(`/blog/${data.slug}`)
        revalidatePath('/admin/posts')
        return { success: true }
    } catch (error) {
        console.error('Error updating post:', error)
        return { success: false, error: 'Erreur lors de la mise à jour' }
    }
}

export async function deletePost(id: string) {
    try {
        await verifyAdmin()

        await prisma.post.delete({
            where: { id }
        })

        revalidatePath('/blog')
        revalidatePath('/admin/posts')
        return { success: true }
    } catch (error) {
        console.error('Error deleting post:', error)
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}

export async function getPostById(id: string) {
    return prisma.post.findUnique({
        where: { id }
    })
}

