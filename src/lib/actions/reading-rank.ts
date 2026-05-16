'use server'

import { prisma } from '@/lib/prisma'
import { getCommunityUser } from './community-auth'

export async function getUserReadingRank() {
    const user = await getCommunityUser()
    if (!user) return null

    // Get total pages read by this user
    const userStats = await prisma.readingList.aggregate({
        where: { userId: user.id },
        _sum: { currentPage: true }
    })
    const userPages = userStats._sum.currentPage || 0

    // Count how many users have more pages read
    const rank = await prisma.readingList.groupBy({
        by: ['userId'],
        _sum: { currentPage: true },
        having: {
            currentPage: {
                _sum: {
                    gt: userPages
                }
            }
        }
    })

    return rank.length + 1
}
