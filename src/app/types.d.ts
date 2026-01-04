type ServerPlayers = {
    online: number
    max: number
}

type ServerMotd = {
    raw: string[]
    clean: string[]
    html: string[]
}

type ServerInfo = {
    hostname: string
    port?: number
    version: string
    icon?: string
    online: boolean
    players?: ServerPlayers
    motd?: ServerMotd
}

type BaseItem = {
    id: number
    createdAt: Date
    updatedAt: Date
}

type GalleryImage = BaseItem & {
    imageUrl: string
    altText: string
    serverConfigId: number | null
}

type TimelineMediaItem = BaseItem & {
    imageUrl: string
    altText: string
    displayOrder: number
    timelineItemId: number
}

type TimelineItem = BaseItem & {
    title: string
    subtitle: string
    description: string
    year: number
    showDetails: boolean
    showDownload: boolean
    detailsUrl: string | null
    downloadUrl: string | null
    serverConfigId: number | null
    media: TimelineMediaItem[]
}

type ServerConfig = BaseItem & {
    serverIps: string[]
    alertMessage: string
    alertVisible: boolean
    server1Visible: boolean
    server2Visible: boolean
    whitelistVisible: boolean
    timelineItems: TimelineItem[]
    galleryImages: GalleryImage[]
}

type ComponentProps = {
    data: ServerConfig
}

type ImageDialogProps = {
    src: string
    alt: string
    index: number
}

type Polls = {
    id: number;
    question: string;
    answers: string[];
    votes: number[];
    visible: boolean;
    createdAt: Date;
    updatedAt: Date;
    until: Date | null;
    endedAt: Date | null;
    pollVotes?: PollVote[];
    _count?: {
        pollVotes: number;
    };
}

type PollVote = {
    id: number;
    pollId: number;
    ipHash: string;
    fingerprint: string;
    votedOption: number;
    createdAt: Date;
}

type Embed = {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: { text: string };
    timestamp?: string;
}