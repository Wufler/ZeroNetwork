"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { timelineItems, timelineMedia } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sendWebhook } from "@/lib/webhook";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createTimelineItem(data: {
  title: string;
  subtitle: string;
  description: string;
  year: number;
  showDetails?: boolean;
  showDownload?: boolean;
  detailsUrl?: string;
  downloadUrl?: string;
}) {
  const user = await checkAdmin();

  const [created] = await db
    .insert(timelineItems)
    .values({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      year: data.year,
      showDetails: data.showDetails ?? false,
      showDownload: data.showDownload ?? false,
      detailsUrl: data.detailsUrl ?? null,
      downloadUrl: data.downloadUrl ?? null,
      serverConfigId: 1,
    })
    .returning();
  const item = { ...created, media: [] };

  await sendWebhook({
    embeds: [
      {
        title: "Timeline Item Created",
        color: 0x3deb34,
        fields: [
          {
            name: "Title",
            value: item.title,
            inline: true,
          },
          {
            name: "Year",
            value: item.year.toString(),
            inline: true,
          },
          {
            name: "Created By",
            value: user.name,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });

  revalidatePath("/");
  return item;
}

export async function updateTimelineItem(
  id: number,
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    year?: number;
    showDetails?: boolean;
    showDownload?: boolean;
    detailsUrl?: string;
    downloadUrl?: string;
    serverConfigId?: number;
  },
) {
  const user = await checkAdmin();

  const [updated] = await db
    .update(timelineItems)
    .set(data)
    .where(eq(timelineItems.id, id))
    .returning();
  if (!updated) throw new Error("Timeline item not found");
  const media = await db
    .select()
    .from(timelineMedia)
    .where(eq(timelineMedia.timelineItemId, id));
  const item = { ...updated, media };

  await sendWebhook({
    embeds: [
      {
        title: "Timeline Item Updated",
        color: 0xffa500,
        fields: [
          {
            name: "Title",
            value: item.title,
            inline: true,
          },
          {
            name: "Year",
            value: item.year.toString(),
            inline: true,
          },
          {
            name: "Updated By",
            value: user.name,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });

  revalidatePath("/");
  return item;
}

export async function deleteTimelineItem(id: number) {
  const user = await checkAdmin();

  const item = await db.query.timelineItems.findFirst({
    where: eq(timelineItems.id, id),
    columns: { title: true, year: true },
  });

  if (!item) {
    throw new Error("Timeline item not found");
  }

  await db.delete(timelineItems).where(eq(timelineItems.id, id));

  await sendWebhook({
    embeds: [
      {
        title: "Timeline Item Deleted",
        color: 0xff0000,
        fields: [
          {
            name: "Title",
            value: item.title,
            inline: true,
          },
          {
            name: "Year",
            value: item.year.toString(),
            inline: true,
          },
          {
            name: "Deleted By",
            value: user.name,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });

  revalidatePath("/");
  return { success: true };
}

export async function addTimelineMedia(
  timelineItemId: number,
  data: {
    imageUrl: string;
    altText: string;
    displayOrder?: number;
    galleryImage?: boolean;
  },
) {
  await checkAdmin();

  const [media] = await db
    .insert(timelineMedia)
    .values({
      timelineItemId,
      imageUrl: data.imageUrl,
      altText: data.altText,
      displayOrder: data.displayOrder ?? 0,
      galleryImage: data.galleryImage ?? false,
    })
    .returning();

  revalidatePath("/");
  return media;
}

export async function updateTimelineMedia(
  id: number,
  data: {
    imageUrl?: string;
    altText?: string;
    displayOrder?: number;
    galleryImage?: boolean;
  },
) {
  await checkAdmin();

  const [media] = await db
    .update(timelineMedia)
    .set(data)
    .where(eq(timelineMedia.id, id))
    .returning();

  revalidatePath("/");
  return media;
}

export async function deleteTimelineMedia(id: number) {
  await checkAdmin();

  await db.delete(timelineMedia).where(eq(timelineMedia.id, id));

  revalidatePath("/");
  return { success: true };
}
