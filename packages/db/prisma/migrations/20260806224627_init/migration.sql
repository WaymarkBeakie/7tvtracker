-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "twitchId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "twitchId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "botEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sevenTvEmoteSetId" TEXT,
    "lastEmoteRefresh" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emote" (
    "id" TEXT NOT NULL,
    "sevenTvId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channelId" TEXT,

    CONSTRAINT "Emote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmoteUsage" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "chatterTwitchId" TEXT NOT NULL,
    "chatterUsername" TEXT NOT NULL,
    "emoteId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmoteUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_twitchId_key" ON "User"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_twitchId_key" ON "Channel"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_login_key" ON "Channel"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_ownerId_key" ON "Channel"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Emote_sevenTvId_key" ON "Emote"("sevenTvId");

-- CreateIndex
CREATE INDEX "EmoteUsage_channelId_usedAt_idx" ON "EmoteUsage"("channelId", "usedAt");

-- CreateIndex
CREATE INDEX "EmoteUsage_channelId_emoteId_idx" ON "EmoteUsage"("channelId", "emoteId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emote" ADD CONSTRAINT "Emote_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsage" ADD CONSTRAINT "EmoteUsage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmoteUsage" ADD CONSTRAINT "EmoteUsage_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "Emote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
