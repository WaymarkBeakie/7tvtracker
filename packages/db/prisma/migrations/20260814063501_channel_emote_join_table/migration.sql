/*
  Warnings:

  - You are about to drop the column `channelId` on the `Emote` table. All the data in the column will be lost.
  - You are about to drop the column `accessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChannelEmoteTotal" DROP CONSTRAINT "ChannelEmoteTotal_emoteId_fkey";

-- DropForeignKey
ALTER TABLE "Emote" DROP CONSTRAINT "Emote_channelId_fkey";

-- DropForeignKey
ALTER TABLE "EmoteUsage" DROP CONSTRAINT "EmoteUsage_emoteId_fkey";

-- DropForeignKey
ALTER TABLE "EmoteUsageDaily" DROP CONSTRAINT "EmoteUsageDaily_emoteId_fkey";

-- AlterTable
ALTER TABLE "Emote" DROP COLUMN "channelId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessToken",
DROP COLUMN "refreshToken";

-- CreateTable
CREATE TABLE "ChannelEmote" (
    "channelId" TEXT NOT NULL,
    "emoteId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelEmote_pkey" PRIMARY KEY ("channelId","emoteId")
);

-- CreateIndex
CREATE INDEX "ChannelEmote_channelId_idx" ON "ChannelEmote"("channelId");

-- AddForeignKey
ALTER TABLE "ChannelEmote" ADD CONSTRAINT "ChannelEmote_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelEmote" ADD CONSTRAINT "ChannelEmote_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsage" ADD CONSTRAINT "EmoteUsage_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsageDaily" ADD CONSTRAINT "EmoteUsageDaily_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelEmoteTotal" ADD CONSTRAINT "ChannelEmoteTotal_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
