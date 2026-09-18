"use server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { serverConfigs } from "@/db/schema";
import { sendWebhook } from "@/lib/webhook";

export async function updateAlert(serverId: number, alertMessage: string) {
  await sendWebhook({
    embeds: [
      {
        title: "Alert Updated",
        description: `"${alertMessage}"`,
        color: 0x3deb34,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const [serverConfig] = await db
    .update(serverConfigs)
    .set({ alertMessage })
    .where(eq(serverConfigs.id, serverId))
    .returning();
  return serverConfig;
}
