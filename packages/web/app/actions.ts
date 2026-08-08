"use server";

import { prisma } from "@emotetracker/db";
import { revalidatePath } from "next/cache";
import { resolveChannelAccess } from "@/lib/channel-access";

export async function getEmoteStats(emoteId: string, days = 14, channelLogin?: string) {
  const access = await resolveChannelAccess(channelLogin);
  if (!access) throw new Error("Not authorized");

  const channelId = access.channel.id;

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [rollupRows, rawRows] = await Promise.all([
    prisma.emoteUsageDaily.findMany({
      where: { channelId, emoteId, date: { gte: since, lt: todayStart } },
    }),
    prisma.emoteUsage.findMany({
      where: { channelId, emoteId, usedAt: { gte: todayStart } },
      select: { usedAt: true },
    }),
  ]);

  const dayBuckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of rollupRows) {
    const key = row.date.toISOString().slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + row.count);
  }
  for (const row of rawRows) {
    const key = row.usedAt.toISOString().slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }

  const dailyUsage = Array.from(dayBuckets.entries()).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }));

  return { dailyUsage };
}

export async function refreshEmotes(channelLogin?: string) {
  const access = await resolveChannelAccess(channelLogin);
  if (!access) throw new Error("Not authorized");

  const channel = access.channel;

  const res = await fetch(`https://7tv.io/v3/users/twitch/${channel.twitchId}`);
  if (!res.ok) {
    if (res.status === 404) return { ok: false, message: "No 7TV account linked to this channel." };
    return { ok: false, message: `7TV API error (${res.status})` };
  }

  const data = await res.json();
  const emotes: { id: string; name: string }[] = data.emote_set?.emotes ?? [];

  if (emotes.length === 0) {
    return { ok: false, message: "7TV returned no emotes — skipping to avoid data loss." };
  }

  for (const e of emotes) {
    await prisma.emote.upsert({
      where: { sevenTvId: e.id },
      update: { name: e.name },
      create: { sevenTvId: e.id, name: e.name, channelId: channel.id },
    });
  }

  const deleted = await prisma.emote.deleteMany({
    where: { channelId: channel.id, sevenTvId: { notIn: emotes.map((e) => e.id) } },
  });

  await prisma.channel.update({
    where: { id: channel.id },
    data: { lastEmoteRefresh: new Date() },
  });

  revalidatePath(channelLogin ? `/dashboard/${channelLogin}` : "/dashboard");
  return {
    ok: true,
    message: `Synced ${emotes.length} emote(s)${deleted.count > 0 ? `, removed ${deleted.count}` : ""}.`,
  };
}

export async function resetChannelStats(channelLogin?: string) {
  const access = await resolveChannelAccess(channelLogin);
  if (!access) throw new Error("Not authorized");

  const channelId = access.channel.id;

  const [rawDeleted, dailyDeleted] = await prisma.$transaction([
    prisma.emoteUsage.deleteMany({ where: { channelId } }),
    prisma.emoteUsageDaily.deleteMany({ where: { channelId } }),
    prisma.channelEmoteTotal.deleteMany({ where: { channelId } }),
  ]);

  revalidatePath(channelLogin ? `/dashboard/${channelLogin}` : "/dashboard");
  return {
    ok: true,
    message: `Deleted ${rawDeleted.count + dailyDeleted.count} usage record(s).`,
  };
}