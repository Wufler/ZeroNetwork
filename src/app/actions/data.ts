'use server'

import prisma from '@/lib/prisma';
import { sendWebhook } from '@/lib/webhook';
import { getBase64 } from '@/lib/base64';

export async function fetchData() {
    const serverConfig = await prisma.serverConfig.findFirst({
        include: {
            timelineItems: {
                include: {
                    media: {
                        orderBy: {
                            displayOrder: 'asc',
                        }
                    }
                },
                orderBy: [
                    { year: 'desc' },
                    { id: 'desc' },
                ]
            },
        },
    });

    if (!serverConfig) return null;

    const timelineItems = await Promise.all(
        serverConfig.timelineItems.map(async (item) => {
            const media = await Promise.all(
                item.media.map(async (m) => {
                    const blurDataUrl = await getBase64(m.imageUrl);
                    return { ...m, blurDataUrl };
                })
            );
            return { ...item, media };
        })
    );

    const galleryImagesRaw = await prisma.timelineMediaItem.findMany({
        where: {
            galleryImage: true,
            timelineItem: {
                serverConfigId: serverConfig.id,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            imageUrl: true,
            altText: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    const galleryImages = await Promise.all(
        galleryImagesRaw.map(async (m) => {
            const blurDataUrl = await getBase64(m.imageUrl);
            return { ...m, blurDataUrl };
        })
    );

    return {
        ...serverConfig,
        timelineItems,
        galleryImages,
    };
}

export async function updateServerIps(id: number, index: string, ip: string) {
    const data = await prisma.serverConfig.findUnique({
        where: { id },
        select: { serverIps: true },
    })

    if (!data) throw new Error('Server config not found')

    const updatedIps = [...data.serverIps]
    updatedIps[parseInt(index)] = ip

    await sendWebhook({
        embeds: [{
            title: "Server IPs Updated",
            color: 0x3deb34,
            fields: updatedIps.map((ip, index) => ({
                name: `IP ${index + 1}`,
                value: ip,
                inline: true
            })),
            timestamp: new Date().toISOString()
        }]
    });

    return prisma.serverConfig.update({
        where: { id },
        data: { serverIps: updatedIps },
    })
}

type VisibilityField = 'alertVisible' | 'server1Visible' | 'server2Visible' | 'whitelistVisible'

export async function updateVisibility(id: number, field: VisibilityField, value: boolean) {
    return prisma.serverConfig.update({
        where: { id },
        data: { [field]: value },
    })
}