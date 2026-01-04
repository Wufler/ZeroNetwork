/*
  Warnings:

  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_serverConfigId_fkey";

-- AlterTable
ALTER TABLE "timeline_media" ADD COLUMN     "galleryImage" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "images";
