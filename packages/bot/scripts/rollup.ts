import "dotenv/config";
import { prisma } from "@emotetracker/db";

async function runRollup() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0); // start of today — anything before this gets rolled up + purged

  console.log(`[rollup] rolling up EmoteUsage older than ${cutoff.toISOString()}`);

  const staleRows = await prisma.emoteUsage.findMany({
    where: { usedAt: { lt: cutoff } },
    select: { id: true, channelId: true, emoteId: true, chatterUsername: true, usedAt: true },
  });

  console.log(`[rollup] found ${staleRows.length} rows to roll up`);
  if (staleRows.length === 0) return;

  type Bucket = { channelId: string; emoteId: string; chatterUsername: string; date: Date; count: number };
  const buckets = new Map<string, Bucket>();

  for (const row of staleRows) {
    const dayStart = new Date(row.usedAt);
    dayStart.setHours(0, 0, 0, 0);
    const key = `${row.channelId}|${row.emoteId}|${row.chatterUsername}|${dayStart.toISOString()}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, {
        channelId: row.channelId,
        emoteId: row.emoteId,
        chatterUsername: row.chatterUsername,
        date: dayStart,
        count: 1,
      });
    }
  }

  for (const bucket of buckets.values()) {
    await prisma.emoteUsageDaily.upsert({
      where: {
        channelId_emoteId_chatterUsername_date: {
          channelId: bucket.channelId,
          emoteId: bucket.emoteId,
          chatterUsername: bucket.chatterUsername,
          date: bucket.date,
        },
      },
      update: { count: { increment: bucket.count } },
      create: bucket,
    });
  }

  await prisma.emoteUsage.deleteMany({
    where: { id: { in: staleRows.map((r) => r.id) } },
  });

  console.log(`[rollup] rolled up ${buckets.size} bucket(s), deleted ${staleRows.length} raw row(s)`);
}

runRollup()
  .then(() => {
    console.log("[rollup] done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[rollup] failed:", err);
    process.exit(1);
  });