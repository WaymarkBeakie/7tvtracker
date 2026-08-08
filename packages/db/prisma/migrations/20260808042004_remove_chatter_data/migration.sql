/*
  Warnings:

  - You are about to drop the column `chatterTwitchId` on the `EmoteUsage` table. All the data in the column will be lost.
  - You are about to drop the column `chatterUsername` on the `EmoteUsage` table. All the data in the column will be lost.
  - You are about to drop the column `chatterUsername` on the `EmoteUsageDaily` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[channelId,emoteId,date]` on the table `EmoteUsageDaily` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EmoteUsageDaily_channelId_emoteId_chatterUsername_date_key";

-- AlterTable
ALTER TABLE "EmoteUsage" DROP COLUMN "chatterTwitchId",
DROP COLUMN "chatterUsername";

-- AlterTable
ALTER TABLE "EmoteUsageDaily" DROP COLUMN "chatterUsername";

-- CreateIndex
CREATE UNIQUE INDEX "EmoteUsageDaily_channelId_emoteId_date_key" ON "EmoteUsageDaily"("channelId", "emoteId", "date");
