/*
  Warnings:

  - You are about to drop the column `active` on the `Emote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChannelEmoteTotal" DROP CONSTRAINT "ChannelEmoteTotal_emoteId_fkey";

-- DropForeignKey
ALTER TABLE "EmoteUsage" DROP CONSTRAINT "EmoteUsage_emoteId_fkey";

-- DropForeignKey
ALTER TABLE "EmoteUsageDaily" DROP CONSTRAINT "EmoteUsageDaily_emoteId_fkey";

-- AlterTable
ALTER TABLE "Emote" DROP COLUMN "active";

-- AddForeignKey
ALTER TABLE "EmoteUsage" ADD CONSTRAINT "EmoteUsage_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsageDaily" ADD CONSTRAINT "EmoteUsageDaily_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelEmoteTotal" ADD CONSTRAINT "ChannelEmoteTotal_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
