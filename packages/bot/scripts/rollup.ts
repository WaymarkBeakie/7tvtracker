import "dotenv/config";
import { prisma } from "@emotetracker/db";

async function runRollup() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0); // start of today — anything before this gets rolled up + purged

  console.log(`[rollup] rolling up EmoteUsage older than ${cutoff.toISOString()}`);

const staleRows = await prisma.emoteUsage.findMany({
    where: { usedAt: { lt: cutoff } },
    select: { id: true, channelId: true, emoteId: true, usedAt: true },
  });

  console.log(`[rollup] found ${staleRows.length} rows to roll up`);
  if (staleRows.length === 0) return;

  type Bucket = {
    channelId: string;
    emoteId: string;
    date: Date;
    count: number;
    hourCounts: number[];
  };
  const buckets = new Map<string, Bucket>();

  for (const row of staleRows) {
    const dayStart = new Date(row.usedAt);
    dayStart.setHours(0, 0, 0, 0);
    const hour = row.usedAt.getHours();
    const key = `${row.channelId}|${row.emoteId}|${dayStart.toISOString()}`;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        channelId: row.channelId,
        emoteId: row.emoteId,
        date: dayStart,
        count: 0,
        hourCounts: new Array(24).fill(0),
      };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    bucket.hourCounts[hour] += 1;
  }

  for (const bucket of buckets.values()) {
    const existing = await prisma.emoteUsageDaily.findUnique({
      where: {
        channelId_emoteId_date: {
          channelId: bucket.channelId,
          emoteId: bucket.emoteId,
          date: bucket.date,
        },
      },
    });

    const mergedHours = new Array(24).fill(0);
    for (let h = 0; h < 24; h++) {
      mergedHours[h] = (existing?.hourCounts[h] ?? 0) + bucket.hourCounts[h];
    }

    await prisma.emoteUsageDaily.upsert({
      where: {
        channelId_emoteId_date: {
          channelId: bucket.channelId,
          emoteId: bucket.emoteId,
          date: bucket.date,
        },
      },
      update: { count: { increment: bucket.count }, hourCounts: mergedHours },
      create: { ...bucket, hourCounts: mergedHours },
    });
  }

  await prisma.emoteUsage.deleteMany({
    where: { id: { in: staleRows.map((r) => r.id) } },
  });

  console.log(`[rollup] rolled up ${buckets.size} bucket(s), deleted ${staleRows.length} raw row(s)`);
}

const RETENTION_DAYS = 90;

async function purgeOldData() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  cutoff.setHours(0, 0, 0, 0);

  const deleted = await prisma.emoteUsageDaily.deleteMany({
    where: { date: { lt: cutoff } },
  });

  if (deleted.count > 0) {
    console.log(`[purge] deleted ${deleted.count} daily record(s) older than ${RETENTION_DAYS} days`);
  }

  const heartbeatCutoff = new Date();
  heartbeatCutoff.setDate(heartbeatCutoff.getDate() - 30);

  const hbDeleted = await prisma.botHeartbeat.deleteMany({
    where: { at: { lt: heartbeatCutoff } },
  });

  if (hbDeleted.count > 0) {
    console.log(`[purge] deleted ${hbDeleted.count} heartbeat(s) older than 30 days`);
  }
}

runRollup()
  .then(() => purgeOldData())
  .then(() => {
    console.log("[rollup] done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[rollup] failed:", err);
    process.exit(1);
  });