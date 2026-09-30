declare type ServerPlayers = {
  online: number;
  max: number;
};

declare type ServerMotd = {
  raw: string[];
  clean: string[];
  html: string[];
};

declare type ServerInfo = {
  hostname: string;
  port?: number;
  version: string;
  icon?: string;
  online: boolean;
  players?: ServerPlayers;
  motd?: ServerMotd;
};

declare type BaseItem = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

declare type GalleryImage = {
  id: number;
  imageUrl: string;
  altText: string;
  createdAt: Date;
  updatedAt: Date;
};

declare type TimelineMediaItem = BaseItem & {
  imageUrl: string;
  altText: string;
  displayOrder: number;
  galleryImage: boolean;
  timelineItemId: number;
};

declare type TimelineItem = BaseItem & {
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string | null;
  backgroundUrl: string | null;
  year: number;
  showDetails: boolean;
  showDownload: boolean;
  detailsUrl: string | null;
  downloadUrl: string | null;
  serverConfigId: number | null;
  media: TimelineMediaItem[];
};

declare type Profile = BaseItem & {
  mention: string;
  username: string;
  uuid: string | null;
  bio: string;
};

declare type ServerConfig = BaseItem & {
  mentionProfiles: Profile[];
  serverIps: string[];
  alertMessage: string;
  alertVisible: boolean;
  server1Visible: boolean;
  server2Visible: boolean;
  whitelistVisible: boolean;
  timelineItems: TimelineItem[];
  galleryImages: GalleryImage[];
};

declare type ComponentProps = {
  data: ServerConfig;
};

declare type Polls = {
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
};

declare type PollVote = {
  id: number;
  pollId: number;
  ipHash: string;
  fingerprint: string;
  votedOption: number;
  createdAt: Date;
};

declare type Embed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
};
