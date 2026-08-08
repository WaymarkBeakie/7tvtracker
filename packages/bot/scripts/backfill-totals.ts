import "dotenv/config";
import { prisma } from "@emotetracker/db";

async function backfill() {
  const rawGroups = await prisma.emoteUsage.groupBy({
    by: ["channelId", "emoteId"],
    _count: { emoteId: true },
  });

  const dailyGroups = await prisma.emoteUsageDaily.groupBy({
    by: ["channelId", "emoteId"],
    _sum: { count: true },
  });

  const totals = new Map<string, { channelId: string; emoteId: string; count: number }>();

  for (const g of rawGroups) {
    const key = `${g.channelId}|${g.emoteId}`;
    totals.set(key, { channelId: g.channelId, emoteId: g.emoteId, count: g._count.emoteId });
  }
  for (const g of dailyGroups) {
    const key = `${g.channelId}|${g.emoteId}`;
    const existing = totals.get(key);
    const add = g._sum.count ?? 0;
    if (existing) existing.count += add;
    else totals.set(key, { channelId: g.channelId, emoteId: g.emoteId, count: add });
  }

  for (const t of totals.values()) {
    await prisma.channelEmoteTotal.upsert({
      where: { channelId_emoteId: { channelId: t.channelId, emoteId: t.emoteId } },
      update: { count: t.count },
      create: t,
    });
  }

  console.log(`[backfill] wrote ${totals.size} total(s)`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });