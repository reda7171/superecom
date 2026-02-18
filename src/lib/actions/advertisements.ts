'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { AdPlacement } from '@prisma/client'

export async function getActiveAds(placement?: AdPlacement) {
    const now = new Date()

    const where: any = {
        isActive: true,
        OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null },
            { startDate: null, endDate: { gte: now } },
        ]
    }

    if (placement) {
        where.placement = placement
    }

    const ads = await prisma.advertisement.findMany({
        where,
        orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
        ]
    })

    return ads
}

export async function getAdById(id: string) {
    return prisma.advertisement.findUnique({
        where: { id }
    })
}

export async function getAllAds() {
    return prisma.advertisement.findMany({
        orderBy: [
            { isActive: 'desc' },
            { priority: 'desc' },
            { createdAt: 'desc' }
        ]
    })
}

export async function createAd(data: {
    title: string
    image: string
    link?: string
    placement: AdPlacement
    isActive?: boolean
    priority?: number
    startDate?: Date
    endDate?: Date
}) {
    const ad = await prisma.advertisement.create({
        data: {
            title: data.title,
            image: data.image,
            link: data.link,
            placement: data.placement,
            isActive: data.isActive ?? false,
            priority: data.priority ?? 0,
            startDate: data.startDate,
            endDate: data.endDate,
        }
    })

    revalidatePath('/')
    return { success: true, data: ad }
}

export async function updateAd(id: string, data: {
    title?: string
    image?: string
    link?: string
    placement?: AdPlacement
    isActive?: boolean
    priority?: number
    startDate?: Date
    endDate?: Date
}) {
    const ad = await prisma.advertisement.update({
        where: { id },
        data
    })

    revalidatePath('/')
    return { success: true, data: ad }
}

export async function deleteAd(id: string) {
    await prisma.advertisement.delete({
        where: { id }
    })

    revalidatePath('/')
    return { success: true }
}

export async function trackAdView(id: string) {
    await prisma.advertisement.update({
        where: { id },
        data: {
            viewCount: { increment: 1 }
        }
    })
}

export async function trackAdClick(id: string) {
    await prisma.advertisement.update({
        where: { id },
        data: {
            clickCount: { increment: 1 }
        }
    })
}
