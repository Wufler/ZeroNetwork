ALTER TABLE "minecraft_profile" RENAME TO "mention_profile";--> statement-breakpoint
ALTER INDEX "minecraft_profile_mention_key" RENAME TO "mention_profile_mention_key";--> statement-breakpoint
ALTER TABLE "mention_profile" RENAME CONSTRAINT "minecraft_profile_pkey" TO "mention_profile_pkey";--> statement-breakpoint
ALTER SEQUENCE "minecraft_profile_id_seq" RENAME TO "mention_profile_id_seq";
