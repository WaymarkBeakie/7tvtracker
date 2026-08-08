-- CreateTable
CREATE TABLE "BotCredential" (
    "id" TEXT NOT NULL DEFAULT 'bot',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotCredential_pkey" PRIMARY KEY ("id")
);
