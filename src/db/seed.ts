import "dotenv/config";
import { db, pool } from ".";
import { polls, serverConfigs, timelineItems, timelineMedia } from "./schema";

const serverData: typeof serverConfigs.$inferInsert = {
  serverIps: ["play.wolfey.me", "play.wolfey.me:25566"],
  alertMessage: "You are currently developing this site.",
  alertVisible: true,
  server1Visible: true,
  server2Visible: true,
  whitelistVisible: true,
};

const timelineData = [
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
    serverConfigId: 1,
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
    serverConfigId: 1,
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
    serverConfigId: 1,
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
    serverConfigId: 1,
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

async function main() {
  await db
    .insert(serverConfigs)
    .values({ id: 1, ...serverData })
    .onConflictDoNothing();

  for (const timeline of timelineData) {
    await db.transaction(async (tx) => {
      const [item] = await tx
        .insert(timelineItems)
        .values({
          title: timeline.title,
          subtitle: timeline.subtitle,
          description: timeline.description,
          year: timeline.year,
          showDetails: timeline.showDetails,
          showDownload: timeline.showDownload,
          detailsUrl: timeline.detailsUrl,
          downloadUrl: timeline.downloadUrl,
          serverConfigId: timeline.serverConfigId,
        })
        .returning({ id: timelineItems.id });
      await tx.insert(timelineMedia).values(
        timeline.media.map((media) => ({
          ...media,
          timelineItemId: item.id,
        })),
      );
    });
  }

  await db.insert(polls).values(pollData);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
