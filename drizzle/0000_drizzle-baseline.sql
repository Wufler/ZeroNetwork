CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"password" text,
	"createdAt" timestamp (3) NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"pollId" integer NOT NULL,
	"ipHash" text NOT NULL,
	"fingerprint" text NOT NULL,
	"votedOption" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answers" text[] NOT NULL,
	"votes" integer[] NOT NULL,
	"visible" boolean DEFAULT false NOT NULL,
	"until" timestamp (3),
	"endedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"serverIps" text[] NOT NULL,
	"alertMessage" text NOT NULL,
	"alertVisible" boolean DEFAULT false NOT NULL,
	"server1Visible" boolean DEFAULT true NOT NULL,
	"server2Visible" boolean DEFAULT true NOT NULL,
	"whitelistVisible" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp (3) NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"impersonatedBy" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"description" text NOT NULL,
	"year" integer NOT NULL,
	"showDetails" boolean DEFAULT false NOT NULL,
	"showDownload" boolean DEFAULT false NOT NULL,
	"detailsUrl" text,
	"downloadUrl" text,
	"serverConfigId" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"imageUrl" text NOT NULL,
	"altText" text NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"galleryImage" boolean DEFAULT false NOT NULL,
	"timelineItemId" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp (3),
	"createdAt" timestamp (3) NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3),
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_pollId_poll_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline" ADD CONSTRAINT "timeline_serverConfigId_servers_id_fk" FOREIGN KEY ("serverConfigId") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_media" ADD CONSTRAINT "timeline_media_timelineItemId_timeline_id_fk" FOREIGN KEY ("timelineItemId") REFERENCES "public"."timeline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "poll_vote_pollId_ipHash_fingerprint_key" ON "poll_vote" USING btree ("pollId","ipHash","fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_key" ON "session" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email");