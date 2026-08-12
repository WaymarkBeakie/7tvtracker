import { prisma } from "@emotetracker/db";
import { BotToggle } from "./bot-toggle";
import { EmoteGrid } from "./emote-grid";
import type { ChannelAccess } from "@/lib/channel-access";
import { BotStatus } from "./bot-status";

export async function DashboardView({
  access,
  channelLogin,
}: {
  access: ChannelAccess;
  channelLogin?: string;
}) {
  const channelId = access.channel.id;

  const channelEmotes = await prisma.emote.findMany({ where: { channelId } });
  const totals = await prisma.channelEmoteTotal.findMany({ where: { channelId } });
  const countByEmoteId = new Map(totals.map((t) => [t.emoteId, t.count]));
  const todayStart = new Date();
  
  todayStart.setHours(0, 0, 0, 0);

  const [lastDaily, todayRaw] = await Promise.all([
    prisma.emoteUsageDaily.groupBy({
      by: ["emoteId"],
      where: { channelId },
      _max: { date: true },
    }),
    prisma.emoteUsage.findMany({
      where: { channelId, usedAt: { gte: todayStart } },
      select: { emoteId: true },
      distinct: ["emoteId"],
    }),
  ]);

  const lastUsedByEmote = new Map<string, string>();
  for (const row of lastDaily) {
    if (row._max.date) {
      lastUsedByEmote.set(row.emoteId, row._max.date.toISOString());
    }
  }
  for (const row of todayRaw) {
    lastUsedByEmote.set(row.emoteId, todayStart.toISOString());
  }

  const emotes = channelEmotes.map((e) => ({
    id: e.id,
    name: e.name,
    sevenTvId: e.sevenTvId,
    count: countByEmoteId.get(e.id) ?? 0,
    lastUsed: lastUsedByEmote.get(e.id) ?? null,
  }));

  const channelMeta = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { lastEmoteRefresh: true },
  });

  const dayAgo = new Date(Date.now() - 24 * 3_600_000);

  const heartbeats = await prisma.botHeartbeat.findMany({
    where: { channelId, at: { gte: dayAgo } },
    select: { at: true },
    orderBy: { at: "asc" },
  });

  const EXPECTED_PER_HOUR = 12; // heartbeat every 5 minutes
  const uptimeBuckets = Array.from({ length: 24 }, (_, i) => {
    const slotStart = new Date(Date.now() - (23 - i) * 3_600_000);
    slotStart.setMinutes(0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 3_600_000);

    const seen = heartbeats.filter((h) => h.at >= slotStart && h.at < slotEnd).length;

    return {
      hour: slotStart.getUTCHours(),
      pct: Math.min(100, Math.round((seen / EXPECTED_PER_HOUR) * 100)),
    };
  });

  const lastHeartbeat = heartbeats.length > 0 ? heartbeats[heartbeats.length - 1].at : null;

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-neutral-950 px-6 py-6 text-white">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">#{access.channel.login}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {access.isOwner ? "Your channel" : "You have editor access to this channel"}
          </p>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-3 font-medium">Emote Tracking Bot</h2>
          <BotStatus
            botEnabled={access.channel.botEnabled}
            lastSeen={lastHeartbeat}
            uptime={uptimeBuckets}
            channelLogin={channelLogin}
            toggle={
              access.isOwner ? (
                <BotToggle enabled={access.channel.botEnabled} channelLogin={channelLogin} />
              ) : null
            }
          />
        </section>

        <section className="flex min-h-0 flex-1 flex-col">
          <h2 className="mb-4 font-medium">{emotes.length} Emotes</h2>
          {emotes.length === 0 ? (
            <p className="text-sm text-neutral-500">No emotes found for this channel.</p>
          ) : (
            <EmoteGrid
              emotes={emotes}
              channelLogin={channelLogin}
              timezone={access.channel.timezone}
              isOwner={access.isOwner}
            />
          )}
        </section>
      </div>
    </main>
  );
}