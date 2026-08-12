-- CreateTable
CREATE TABLE "BotHeartbeat" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotHeartbeat_channelId_at_idx" ON "BotHeartbeat"("channelId", "at");

-- AddForeignKey
ALTER TABLE "BotHeartbeat" ADD CONSTRAINT "BotHeartbeat_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
