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

type ImageItem = BaseItem & {
    image: string
    alt: string
}

type TimelineItem = BaseItem & {
    title: string
    subtitle: string
    description: string
    year: number
    images: string[]
    alt: string[]
    url: string[]
    button: boolean[]
}

type ServerConfig = BaseItem & {
    ips: string[]
    alert: string
    visible: boolean[] // [alert, server1, server2, whitelist]
    timeline: TimelineItem[]
    images: ImageItem[]
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