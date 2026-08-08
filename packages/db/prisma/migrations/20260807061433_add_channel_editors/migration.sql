-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sevenTvId" TEXT;

-- CreateTable
CREATE TABLE "ChannelEditor" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "sevenTvUserId" TEXT NOT NULL,
    "permissions" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelEditor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelEditor_sevenTvUserId_idx" ON "ChannelEditor"("sevenTvUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelEditor_channelId_sevenTvUserId_key" ON "ChannelEditor"("channelId", "sevenTvUserId");

-- AddForeignKey
ALTER TABLE "ChannelEditor" ADD CONSTRAINT "ChannelEditor_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
