import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function getOrders() {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('userEmail')?.value

    if (!userEmail) {
        return null
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                email: userEmail
            },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                coverImage: true,
                            }
                        },
                        pack: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return orders
    } catch (error) {
        return []
    }
}
