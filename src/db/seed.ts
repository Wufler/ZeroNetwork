import "dotenv/config";
import { and, asc, eq } from "drizzle-orm";
import { db, pool } from ".";
import {
  mentionProfiles,
  polls,
  serverConfigs,
  timelineItems,
  timelineMedia,
} from "./schema";

const serverData: typeof serverConfigs.$inferInsert = {
  serverIps: ["play.wolfey.me", "play.wolfey.me:25566"],
  alertMessage: "You are currently developing this site.",
  alertVisible: true,
  server1Visible: true,
  server2Visible: true,
  whitelistVisible: true,
};

type TimelineSeed = Omit<
  typeof timelineItems.$inferInsert,
  "serverConfigId"
> & {
  media: Omit<typeof timelineMedia.$inferInsert, "timelineItemId">[];
};

const timelineData: TimelineSeed[] = [
  {
    title: "Javarock v4",
    subtitle:
      "The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18",
    description:
      "The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18",
    year: 2025,
    showDetails: true,
    showDownload: true,
    detailsUrl: "https://feed-the-beast.com/modpacks/130-ftb-stoneblock-4",
    downloadUrl: "https://www.feed-the-beast.com/ftb-app",
    media: [
      {
        imageUrl: "https://up.wolfey.me/Ox9BuzXO",
        altText: "Server Image 6",
        displayOrder: 0,
        galleryImage: true,
      },
      {
        imageUrl: "https://up.wolfey.me/dm5AK5zH",
        altText: "Server Image 7",
        displayOrder: 1,
        galleryImage: true,
      },
      {
        imageUrl: "https://up.wolfey.me/oGZ_L0Ep",
        altText: "Server Image 8",
        displayOrder: 2,
        galleryImage: true,
      },
      {
        imageUrl: "https://up.wolfey.me/BPZh8CgU",
        altText: "Server Image 9",
        displayOrder: 3,
        galleryImage: true,
      },
    ],
  },
  {
    title: "Javarock v123",
    subtitle: "Text here",
    description: "Text here",
    year: 2024,
    showDetails: false,
    showDownload: true,
    detailsUrl: "https://www.feed-the-beast.com/modpacks/129-ftb-skies-2",
    downloadUrl: "https://www.feed-the-beast.com/ftb-app",
    media: [
      {
        imageUrl: "https://up.wolfey.me/61go2B-r",
        altText: "Server Image 6",
        displayOrder: 0,
        galleryImage: true,
      },
      {
        imageUrl: "https://up.wolfey.me/2ecONgMj",
        altText: "Server Image 7",
        displayOrder: 1,
        galleryImage: true,
      },
    ],
  },
  {
    title: "Javarock v4",
    subtitle:
      "The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18",
    description:
      "The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18",
    year: 2023,
    showDetails: true,
    showDownload: false,
    detailsUrl: "https://feed-the-beast.com/modpacks/130-ftb-stoneblock-4",
    downloadUrl: "https://www.feed-the-beast.com/ftb-app",
    media: [
      {
        imageUrl: "https://up.wolfey.me/1DmhYiww",
        altText: "Server Image 6",
        displayOrder: 0,
        galleryImage: true,
      },
      {
        imageUrl: "https://up.wolfey.me/2G-Qpv0m",
        altText: "Server Image 7",
        displayOrder: 1,
        galleryImage: true,
      },
    ],
  },
  {
    title: "Javarock v4",
    subtitle:
      "The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18",
    description:
      "The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18",
    year: 2022,
    showDetails: true,
    showDownload: true,
    detailsUrl: "https://feed-the-beast.com/modpacks/130-ftb-stoneblock-4",
    downloadUrl: "https://www.feed-the-beast.com/ftb-app",
    media: [
      {
        imageUrl: "https://up.wolfey.me/z2gPiu5U",
        altText: "Server Image 6",
        displayOrder: 0,
        galleryImage: true,
      },
    ],
  },
];

const pollData: (typeof polls.$inferInsert)[] = [
  {
    question: "What's your favorite feature?",
    answers: ["Timeline", "Server status"],
    visible: true,
    votes: [0, 0],
  },
  {
    question: "How did you find us?",
    answers: ["Discord", "GitHub", "Friend", "Search"],
    visible: true,
    votes: [0, 0, 0, 0],
  },
];

const mentionData: (typeof mentionProfiles.$inferInsert)[] = [
  { mention: "wolfey", username: "Wolfey" },
  { mention: "imher0", username: "ImHer0" },
];

async function main() {
  await db.transaction(async (tx) => {
    const [existingServer] = await tx
      .select({ id: serverConfigs.id })
      .from(serverConfigs)
      .orderBy(asc(serverConfigs.id))
      .limit(1);
    const server =
      existingServer ??
      (
        await tx
          .insert(serverConfigs)
          .values(serverData)
          .returning({ id: serverConfigs.id })
      )[0];

    for (const { media, ...timeline } of timelineData) {
      const [existingItem] = await tx
        .select({ id: timelineItems.id })
        .from(timelineItems)
        .where(
          and(
            eq(timelineItems.serverConfigId, server.id),
            eq(timelineItems.title, timeline.title),
            eq(timelineItems.year, timeline.year),
          ),
        )
        .limit(1);
      const item =
        existingItem ??
        (
          await tx
            .insert(timelineItems)
            .values({
              ...timeline,
              thumbnailUrl: media[0]?.imageUrl,
              backgroundUrl: media[0]?.imageUrl,
              serverConfigId: server.id,
            })
            .returning({ id: timelineItems.id })
        )[0];
      const existingMedia = await tx
        .select({ imageUrl: timelineMedia.imageUrl })
        .from(timelineMedia)
        .where(eq(timelineMedia.timelineItemId, item.id));
      const imageUrls = new Set(existingMedia.map((image) => image.imageUrl));
      const missingMedia = media.filter(
        (image) => !imageUrls.has(image.imageUrl),
      );
      if (missingMedia.length > 0) {
        await tx
          .insert(timelineMedia)
          .values(
            missingMedia.map((image) => ({
              ...image,
              timelineItemId: item.id,
            })),
          );
      }
    }

    for (const poll of pollData) {
      const [existingPoll] = await tx
        .select({ id: polls.id })
        .from(polls)
        .where(eq(polls.question, poll.question))
        .limit(1);
      if (!existingPoll) await tx.insert(polls).values(poll);
    }

    await tx
      .insert(mentionProfiles)
      .values(mentionData)
      .onConflictDoNothing({ target: mentionProfiles.mention });
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
