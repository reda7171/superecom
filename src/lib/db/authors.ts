
import { prisma } from '@/lib/prisma'
import { getCached } from '@/lib/cache'

export async function getAuthorProfile(name: string) {
    return prisma.authorProfile.findUnique({
        where: { name }
    })
}
