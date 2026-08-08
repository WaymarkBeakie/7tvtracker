-- CreateTable
CREATE TABLE "ChannelEmoteTotal" (
    "channelId" TEXT NOT NULL,
    "emoteId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelEmoteTotal_pkey" PRIMARY KEY ("channelId","emoteId")
);

-- CreateTable
CREATE TABLE "EmoteUsageDaily" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "emoteId" TEXT NOT NULL,
    "chatterUsername" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmoteUsageDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmoteUsageDaily_channelId_date_idx" ON "EmoteUsageDaily"("channelId", "date");

-- CreateIndex
CREATE INDEX "EmoteUsageDaily_channelId_emoteId_date_idx" ON "EmoteUsageDaily"("channelId", "emoteId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EmoteUsageDaily_channelId_emoteId_chatterUsername_date_key" ON "EmoteUsageDaily"("channelId", "emoteId", "chatterUsername", "date");

-- AddForeignKey
ALTER TABLE "ChannelEmoteTotal" ADD CONSTRAINT "ChannelEmoteTotal_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelEmoteTotal" ADD CONSTRAINT "ChannelEmoteTotal_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsageDaily" ADD CONSTRAINT "EmoteUsageDaily_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsageDaily" ADD CONSTRAINT "EmoteUsageDaily_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
