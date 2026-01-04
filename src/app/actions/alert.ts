"use server"
import prisma from "@/lib/prisma";
import { sendWebhook } from "@/lib/webhook";

export async function updateAlert(serverId: number, alertMessage: string) {
    await sendWebhook({
        embeds: [{
            title: "Alert Updated",
            description: `"${alertMessage}"`,
            color: 0x3deb34,
            timestamp: new Date().toISOString()
        }]
    });

    return await prisma.serverConfig.update({
        where: { id: serverId },
        data: { alertMessage }
    });
}