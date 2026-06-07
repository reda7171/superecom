'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Public Actions

/**
 * Récupère les articles de blog publiés avec pagination
 */
export async function getPublishedPosts(page: number = 1, limit: number = 9, category?: string, language: string = 'fr') {
    const skip = (page - 1) * limit
    const where: any = { published: true, language }
    if (category) {
        where.category = category
    }

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
                author: {
                    select: {
                        fullName: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        comments: {
                            where: { isApproved: true }
                        }
                    }
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

/**
 * Récupère les catégories uniques
 */
export async function getPostCategories(language: string = 'fr') {
    const categories = await prisma.post.findMany({
        where: { published: true, category: { not: null }, language },
        select: { category: true },
        distinct: ['category']
    })
    return categories.map((c) => c.category).filter(Boolean) as string[]
}

/**
 * Récupère un article par son slug
 */
export async function getPostBySlug(slug: string, language?: string) {
    const where: any = { slug, published: true }
    if (language) {
        where.language = language
    }
    
    return prisma.post.findFirst({
        where,
        include: {
            author: {
                select: {
                    fullName: true,
                    image: true,
                    bio: true
                }
            },
            comments: {
                where: { isApproved: true },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { fullName: true, image: true }
                    }
                }
            },
            _count: {
                select: { comments: { where: { isApproved: true } } }
            },
            products: {
                select: {
                    id: true,
                    title: true,
                    author: true,
                    description: true,
                    bestQuote: true,
                    bestLessons: true,
                    bestFor: true,
                    bestChapters: true,
                    price: true,
                    image: true,
                    stock: true
                }
            }
        }
    })
}

// Admin / Internal Actions (Simplified for now)

/**
 * Récupère les derniers articles pour la page d'accueil (optionnel)
 */
export async function getRecentPosts(limit = 3, language: string = 'fr') {
    return prisma.post.findMany({
        where: { published: true, language },
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

export async function getAllPosts(page = 1, limit = 20, search?: string, language?: string) {
    const skip = (page - 1) * limit
    const where: any = {}

    if (search) {
        where.title = { contains: search }
    }

    if (language) {
        where.language = language
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
                authorId: adminId,
                category: data.category,
                tags: data.tags || null,
                language: data.language || 'fr',
                products: data.bookIds ? {
                    connect: data.bookIds.map((id: string) => ({ id }))
                } : undefined
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
                publishedAt: data.published && !data.publishedAt ? new Date() : data.publishedAt,
                category: data.category,
                tags: data.tags || null,
                language: data.language || 'fr',
                products: {
                    set: data.bookIds ? data.bookIds.map((id: string) => ({ id })) : []
                }
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
        where: { id },
        include: {
            products: {
                select: { id: true, title: true }
            }
        }
    })
}

/**
 * Récupère les articles parlant d'un livre spécifique
 */
export async function getPostsByBookId(productId: string, language: string = 'fr') {
    return prisma.post.findMany({
        where: {
            published: true,
            language,
            products: {
                some: { id: productId }
            }
        },
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true
        }
    })
}

/**
 * Récupère les articles similaires (même catégorie)
 */
export async function getRelatedPosts(postId: string, category: string | null, language: string = 'fr', limit = 3) {
    return prisma.post.findMany({
        where: {
            published: true,
            language,
            id: { not: postId },
            ...(category ? { category } : {})
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            category: true,
            author: { select: { fullName: true } }
        }
    })
}

/**
 * Incrémente le compteur de vues d'un article
 */
export async function incrementPostViews(id: string) {
    try {
        await prisma.post.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        })
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

