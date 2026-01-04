import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
    adapter,
});

const serverData: Prisma.ServerConfigCreateInput = {
    serverIps: ['play.wolfey.me', 'play.wolfey.me:25566'],
    alertMessage: 'You are currently developing this site.',
    alertVisible: true,
    server1Visible: true,
    server2Visible: true,
    whitelistVisible: true,
};

const timelineData = [
    {
        title: 'Javarock v4',
        subtitle: 'The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18',
        description: 'The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18',
        year: 2025,
        showDetails: true,
        showDownload: true,
        detailsUrl: 'https://feed-the-beast.com/modpacks/130-ftb-stoneblock-4',
        downloadUrl: 'https://www.feed-the-beast.com/ftb-app',
        serverConfigId: 1,
        media: [
            { imageUrl: 'https://up.wolfey.me/Ox9BuzXO', altText: 'Server Image 6', displayOrder: 0 },
            { imageUrl: 'https://up.wolfey.me/dm5AK5zH', altText: 'Server Image 7', displayOrder: 1 },
            { imageUrl: 'https://up.wolfey.me/oGZ_L0Ep', altText: 'Server Image 8', displayOrder: 2 },
            { imageUrl: 'https://up.wolfey.me/BPZh8CgU', altText: 'Server Image 9', displayOrder: 3 },
        ],
    },
    {
        title: 'Javarock v123',
        subtitle: 'Text here',
        description: 'Text here',
        year: 2024,
        showDetails: false,
        showDownload: true,
        detailsUrl: 'https://www.feed-the-beast.com/modpacks/129-ftb-skies-2',
        downloadUrl: 'https://www.feed-the-beast.com/ftb-app',
        serverConfigId: 1,
        media: [
            { imageUrl: 'https://up.wolfey.me/61go2B-r', altText: 'Server Image 6', displayOrder: 0 },
            { imageUrl: 'https://up.wolfey.me/2ecONgMj', altText: 'Server Image 7', displayOrder: 1 },
        ],
    },
    {
        title: 'Javarock v4',
        subtitle: 'The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18',
        description: 'The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18',
        year: 2023,
        showDetails: true,
        showDownload: false,
        detailsUrl: 'https://feed-the-beast.com/modpacks/130-ftb-stoneblock-4',
        downloadUrl: 'https://www.feed-the-beast.com/ftb-app',
        serverConfigId: 1,
        media: [
            { imageUrl: 'https://up.wolfey.me/1DmhYiww', altText: 'Server Image 6', displayOrder: 0 },
            { imageUrl: 'https://up.wolfey.me/2G-Qpv0m', altText: 'Server Image 7', displayOrder: 1 },
        ],
    },
    {
        title: 'Javarock v4',
        subtitle: 'The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18',
        description: 'The 4th world of Javarock was a custom vanilla survival server, filled with plugins and datapacks and supported both Java and Bedrock editions in version 1.18',
        year: 2022,
        showDetails: true,
        showDownload: true,
        detailsUrl: 'https://feed-the-beast.com/modpacks/130-ftb-stoneblock-4',
        downloadUrl: 'https://www.feed-the-beast.com/ftb-app',
        serverConfigId: 1,
        media: [
            { imageUrl: 'https://up.wolfey.me/z2gPiu5U', altText: 'Server Image 6', displayOrder: 0 },
        ],
    },
];

const pollData: Prisma.PollCreateManyInput[] = [
    {
        question: "What's your favorite feature?",
        answers: ['Timeline', 'Server status'],
        visible: true,
        votes: [0, 0],
    },
    {
        question: "How did you find us?",
        answers: ['Discord', 'GitHub', 'Friend', 'Search'],
        visible: true,
        votes: [0, 0, 0, 0],
    },
];

const galleryImagesData: Prisma.GalleryImageCreateManyInput[] = [
    { imageUrl: 'https://up.wolfey.me/INmc5-Zu', altText: 'Server Image 1', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/onavCRTD', altText: 'Server Image 2', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/MXeTbumU', altText: 'Server Image 3', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/fCkapYPl', altText: 'Server Image 4', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/PeC-Cz5V', altText: 'Server Image 5', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/qi_85lbY', altText: 'Server Image 6', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/Fx2fxhIH', altText: 'Server Image 7', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/smjx5CNl', altText: 'Server Image 8', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/O8ZIwvHv', altText: 'Server Image 9', serverConfigId: 1 },
    { imageUrl: 'https://up.wolfey.me/GtoJ4VAY', altText: 'Server Image 10', serverConfigId: 1 },
];

async function main() {
    await prisma.serverConfig.upsert({
        where: { id: 1 },
        update: {},
        create: serverData,
    });

    for (const timeline of timelineData) {
        await prisma.timelineItem.create({
            data: {
                title: timeline.title,
                subtitle: timeline.subtitle,
                description: timeline.description,
                year: timeline.year,
                showDetails: timeline.showDetails,
                showDownload: timeline.showDownload,
                detailsUrl: timeline.detailsUrl,
                downloadUrl: timeline.downloadUrl,
                serverConfigId: timeline.serverConfigId,
                media: {
                    create: timeline.media,
                },
            },
        });
    }

    await prisma.poll.createMany({
        data: pollData,
    });

    await prisma.galleryImage.createMany({
        data: galleryImagesData,
    });

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });