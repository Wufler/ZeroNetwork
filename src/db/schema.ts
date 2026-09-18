import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    role: text("role"),
    banned: boolean("banned"),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { mode: "date", precision: 3 }),
    createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
  },
  (table) => [uniqueIndex("user_email_key").on(table.email)],
);

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    impersonatedBy: text("impersonatedBy"),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("session_token_key").on(table.token)],
);

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    mode: "date",
    precision: 3,
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    mode: "date",
    precision: 3,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }).notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", precision: 3 }),
  updatedAt: timestamp("updatedAt", { mode: "date", precision: 3 }),
});

export const serverConfigs = pgTable("servers", {
  id: serial("id").primaryKey(),
  serverIps: text("serverIps").array().notNull(),
  alertMessage: text("alertMessage").notNull(),
  alertVisible: boolean("alertVisible").default(false).notNull(),
  server1Visible: boolean("server1Visible").default(true).notNull(),
  server2Visible: boolean("server2Visible").default(true).notNull(),
  whitelistVisible: boolean("whitelistVisible").default(false).notNull(),
  ...timestamps,
});

export const timelineItems = pgTable("timeline", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  year: integer("year").notNull(),
  showDetails: boolean("showDetails").default(false).notNull(),
  showDownload: boolean("showDownload").default(false).notNull(),
  detailsUrl: text("detailsUrl"),
  downloadUrl: text("downloadUrl"),
  serverConfigId: integer("serverConfigId").references(() => serverConfigs.id),
  ...timestamps,
});

export const timelineMedia = pgTable("timeline_media", {
  id: serial("id").primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  altText: text("altText").notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  galleryImage: boolean("galleryImage").default(false).notNull(),
  timelineItemId: integer("timelineItemId")
    .notNull()
    .references(() => timelineItems.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const polls = pgTable("poll", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answers: text("answers").array().notNull(),
  votes: integer("votes").array().notNull(),
  visible: boolean("visible").default(false).notNull(),
  until: timestamp("until", { mode: "date", precision: 3 }),
  endedAt: timestamp("endedAt", { mode: "date", precision: 3 }),
  ...timestamps,
});

export const pollVotes = pgTable(
  "poll_vote",
  {
    id: serial("id").primaryKey(),
    pollId: integer("pollId")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    ipHash: text("ipHash").notNull(),
    fingerprint: text("fingerprint").notNull(),
    votedOption: integer("votedOption").notNull(),
    createdAt: timestamp("createdAt", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("poll_vote_pollId_ipHash_fingerprint_key").on(
      table.pollId,
      table.ipHash,
      table.fingerprint,
    ),
  ],
);

export const serverConfigRelations = relations(serverConfigs, ({ many }) => ({
  timelineItems: many(timelineItems),
}));

export const timelineItemRelations = relations(
  timelineItems,
  ({ one, many }) => ({
    serverConfig: one(serverConfigs, {
      fields: [timelineItems.serverConfigId],
      references: [serverConfigs.id],
    }),
    media: many(timelineMedia),
  }),
);

export const timelineMediaRelations = relations(timelineMedia, ({ one }) => ({
  timelineItem: one(timelineItems, {
    fields: [timelineMedia.timelineItemId],
    references: [timelineItems.id],
  }),
}));

export const pollRelations = relations(polls, ({ many }) => ({
  pollVotes: many(pollVotes),
}));

export const pollVoteRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
