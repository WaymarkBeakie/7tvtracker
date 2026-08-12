-- AlterTable
ALTER TABLE "EmoteUsageDaily" ADD COLUMN     "hourCounts" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
