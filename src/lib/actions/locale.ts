'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getCommunityUser } from '@/lib/actions/community-auth'
import { getAdminUser } from '@/lib/actions/auth'

export async function updateUserLocale(locale: string) {
    try {
        const cookieStore = await cookies()

        // 1. Update NEXT_LOCALE cookie first (essential for everyone)
        cookieStore.set('NEXT_LOCALE', , { path: '/', secure: process.env.NODE_ENV === 'production' })

        // 2. Try to update logged-in user preference
        const communityUser = await getCommunityUser()
        if (communityUser) {
            await prisma.user.update({
                where: { id: communityUser.id },
                data: { locale }
            })
            return { success: true }
        }

        const adminId = await getAdminUser()
        if (adminId) {
            await prisma.user.update({
                where: { id: adminId },
                data: { locale }
            })
            return { success: true }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating locale:', error)
        return { success: false }
    }
}
