CREATE TABLE "minecraft_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"mention" text NOT NULL,
	"username" text NOT NULL,
	"uuid" text,
	"bio" text DEFAULT '' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "minecraft_profile_mention_key" ON "minecraft_profile" USING btree ("mention");