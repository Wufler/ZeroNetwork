"use server";

import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serverConfigs, timelineItems, timelineMedia } from "@/db/schema";
import { sendWebhook } from "@/lib/webhook";

export async function fetchData() {
  const serverConfig = await db.query.serverConfigs.findFirst({
    with: {
      timelineItems: {
        with: {
          media: {
            orderBy: [asc(timelineMedia.displayOrder)],
          },
        },
        orderBy: [desc(timelineItems.year), desc(timelineItems.id)],
      },
    },
  });

  if (!serverConfig) return null;

  const timelineData = serverConfig.timelineItems;

  const galleryImagesRaw = await db
    .select({
      id: timelineMedia.id,
      imageUrl: timelineMedia.imageUrl,
      altText: timelineMedia.altText,
      createdAt: timelineMedia.createdAt,
      updatedAt: timelineMedia.updatedAt,
    })
    .from(timelineMedia)
    .innerJoin(
      timelineItems,
      eq(timelineMedia.timelineItemId, timelineItems.id),
    )
    .where(
      and(
        eq(timelineMedia.galleryImage, true),
        eq(timelineItems.serverConfigId, serverConfig.id),
      ),
    )
    .orderBy(desc(timelineMedia.createdAt));

  const galleryImages = galleryImagesRaw;

  return {
    ...serverConfig,
    timelineItems: timelineData,
    galleryImages,
  };
}

export async function updateServerIps(id: number, index: string, ip: string) {
  const data = await db.query.serverConfigs.findFirst({
    where: eq(serverConfigs.id, id),
    columns: { serverIps: true },
  });

  if (!data) throw new Error("Server config not found");

  const updatedIps = [...data.serverIps];
  updatedIps[parseInt(index)] = ip;

  await sendWebhook({
    embeds: [
      {
        title: "Server IPs Updated",
        color: 0x3deb34,
        fields: updatedIps.map((ip, index) => ({
          name: `IP ${index + 1}`,
          value: ip,
          inline: true,
        })),
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const [serverConfig] = await db
    .update(serverConfigs)
    .set({ serverIps: updatedIps })
    .where(eq(serverConfigs.id, id))
    .returning();
  return serverConfig;
}

type VisibilityField =
  | "alertVisible"
  | "server1Visible"
  | "server2Visible"
  | "whitelistVisible";

export async function updateVisibility(
  id: number,
  field: VisibilityField,
  value: boolean,
) {
  const [serverConfig] = await db
    .update(serverConfigs)
    .set({ [field]: value })
    .where(eq(serverConfigs.id, id))
    .returning();
  return serverConfig;
}
