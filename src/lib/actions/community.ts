'use server'

import { prisma } from '@/lib/prisma'

export interface TopReader {
    id: string
    fullName: string
    image: string | null
    readCount: number
    city: string | null
}

export async function getTopReaders(limit: number = 10): Promise<TopReader[]> {
    try {
        const topReaders = await prisma.readingList.groupBy({
            by: ['userId'],
            where: {
                status: 'COMPLETED'
            },
            _count: {
                productId: true
            },
            orderBy: {
                _count: {
                    productId: 'desc'
                }
            },
            take: limit
        })

        if (!topReaders.length) return []

        // Fetch user details
        const userIds = topReaders.map(r => r.userId)
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                fullName: true,
                image: true,
                city: true
            }
        })

        // Map users to their counts
        const result = topReaders.map(reader => {
            const user = users.find(u => u.id === reader.userId)
            return {
                id: reader.userId,
                fullName: user?.fullName || 'Utilisateur inconnu',
                image: user?.image || null,
                readCount: reader._count.productId,
                city: user?.city || null
            }
        }).sort((a, b) => b.readCount - a.readCount)

        return result
    } catch (error) {
        console.error('Error fetching top readers:', error)
        return []
    }
}

export async function getUserExchangeCount(userId: string): Promise<number> {
    try {
        const count = await prisma.exchange.count({
            where: {
                OR: [
                    { requesterId: userId },
                    { responderId: userId }
                ]
            }
        })
        return count
    } catch (error) {
        console.error('Error counting exchanges:', error)
        return 0
    }
}
