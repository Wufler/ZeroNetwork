/*
  Warnings:

  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `poll_vote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `servers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_serversId_fkey";

-- DropForeignKey
ALTER TABLE "poll_vote" DROP CONSTRAINT "poll_vote_pollId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "timeline" DROP CONSTRAINT "timeline_serversId_fkey";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "images";

-- DropTable
DROP TABLE "poll";

-- DropTable
DROP TABLE "poll_vote";

-- DropTable
DROP TABLE "servers";

-- DropTable
DROP TABLE "session";

-- DropTable
DROP TABLE "timeline";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "verification";
