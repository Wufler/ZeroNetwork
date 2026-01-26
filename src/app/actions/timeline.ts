'use server'

import prisma from '@/lib/prisma'
import { sendWebhook } from '@/lib/webhook'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Unauthorized')
    }
    return session.user
}

export async function createTimelineItem(data: {
    title: string
    subtitle: string
    description: string
    year: number
    showDetails?: boolean
    showDownload?: boolean
    detailsUrl?: string
    downloadUrl?: string
}) {
    const user = await checkAdmin()

    const item = await prisma.timelineItem.create({
        data: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            year: data.year,
            showDetails: data.showDetails ?? false,
            showDownload: data.showDownload ?? false,
            detailsUrl: data.detailsUrl,
            downloadUrl: data.downloadUrl,
            serverConfigId: 1,
        },
        include: {
            media: true,
        },
    })

    await sendWebhook({
        embeds: [
            {
                title: 'Timeline Item Created',
                color: 0x3deb34,
                fields: [
                    {
                        name: 'Title',
                        value: item.title,
                        inline: true,
                    },
                    {
                        name: 'Year',
                        value: item.year.toString(),
                        inline: true,
                    },
                    {
                        name: 'Created By',
                        value: user.name,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
            },
        ],
    })

    revalidatePath('/')
    return item
}

export async function updateTimelineItem(
    id: number,
    data: {
        title?: string
        subtitle?: string
        description?: string
        year?: number
        showDetails?: boolean
        showDownload?: boolean
        detailsUrl?: string
        downloadUrl?: string
        serverConfigId?: number
    }
) {
    const user = await checkAdmin()

    const item = await prisma.timelineItem.update({
        where: { id },
        data,
        include: {
            media: true,
        },
    })

    await sendWebhook({
        embeds: [
            {
                title: 'Timeline Item Updated',
                color: 0xffa500,
                fields: [
                    {
                        name: 'Title',
                        value: item.title,
                        inline: true,
                    },
                    {
                        name: 'Year',
                        value: item.year.toString(),
                        inline: true,
                    },
                    {
                        name: 'Updated By',
                        value: user.name,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
            },
        ],
    })

    revalidatePath('/')
    return item
}

export async function deleteTimelineItem(id: number) {
    const user = await checkAdmin()

    const item = await prisma.timelineItem.findUnique({
        where: { id },
        select: { title: true, year: true },
    })

    if (!item) {
        throw new Error('Timeline item not found')
    }

    await prisma.timelineItem.delete({
        where: { id },
    })

    await sendWebhook({
        embeds: [
            {
                title: 'Timeline Item Deleted',
                color: 0xff0000,
                fields: [
                    {
                        name: 'Title',
                        value: item.title,
                        inline: true,
                    },
                    {
                        name: 'Year',
                        value: item.year.toString(),
                        inline: true,
                    },
                    {
                        name: 'Deleted By',
                        value: user.name,
                        inline: true,
                    },
                ],
                timestamp: new Date().toISOString(),
            },
        ],
    })

    revalidatePath('/')
    return { success: true }
}

export async function addTimelineMedia(
    timelineItemId: number,
    data: {
        imageUrl: string
        altText: string
        displayOrder?: number
        galleryImage?: boolean
    }
) {
    await checkAdmin()

    const media = await prisma.timelineMediaItem.create({
        data: {
            timelineItemId,
            imageUrl: data.imageUrl,
            altText: data.altText,
            displayOrder: data.displayOrder ?? 0,
            galleryImage: data.galleryImage ?? false,
        },
    })

    revalidatePath('/')
    return media
}

export async function updateTimelineMedia(
    id: number,
    data: {
        imageUrl?: string
        altText?: string
        displayOrder?: number
        galleryImage?: boolean
    }
) {
    await checkAdmin()

    const media = await prisma.timelineMediaItem.update({
        where: { id },
        data,
    })

    revalidatePath('/')
    return media
}

export async function deleteTimelineMedia(id: number) {
    await checkAdmin()

    await prisma.timelineMediaItem.delete({
        where: { id },
    })

    revalidatePath('/')
    return { success: true }
}
