import { prisma } from "@emotetracker/db";

type SevenTvEmote = { id: string; name: string };

const channelEmoteCache = new Map<string, Map<string, string>>(); // channelLogin -> (emoteName -> emoteId in our DB)
let globalEmoteCache: Map<string, string> | null = null;

async function fetchSevenTvChannelData(twitchId: string): Promise<{
  emoteSetId: string | null;
  emotes: SevenTvEmote[];
  editors: { id: string; permissions: number; added_at: number }[];
}> {
  const res = await fetch(`https://7tv.io/v3/users/twitch/${twitchId}`);
  if (!res.ok) {
    if (res.status === 404) return { emoteSetId: null, emotes: [], editors: [] };
    throw new Error(`7TV API error ${res.status}`);
  }
  const data = await res.json();
  return {
    emoteSetId: data.emote_set?.id ?? null,
    emotes: data.emote_set?.emotes ?? [],
    editors: data.user?.editors ?? [],
  };
}

async function fetchSevenTvGlobalEmotes(): Promise<SevenTvEmote[]> {
  const res = await fetch("https://7tv.io/v3/emote-sets/global");
  if (!res.ok) throw new Error(`7TV global API error ${res.status}`);
  const data = await res.json();
  return data.emotes ?? [];
}

async function upsertEmotes(emotes: SevenTvEmote[], channelDbId: string | null) {
  const nameToId = new Map<string, string>();

  for (const e of emotes) {
    const row = await prisma.emote.upsert({
      where: { sevenTvId: e.id },
      update: { name: e.name },
      create: { sevenTvId: e.id, name: e.name },
    });

    if (channelDbId) {
      await prisma.channelEmote.upsert({
        where: { channelId_emoteId: { channelId: channelDbId, emoteId: row.id } },
        update: {},
        create: { channelId: channelDbId, emoteId: row.id },
      });
    }

    nameToId.set(e.name, row.id);
  }

  return nameToId;
}

export async function refreshChannelEmotes(
  channelLogin: string,
  channelTwitchId: string,
  channelDbId: string
): Promise<string | null> {
  const { emoteSetId, emotes, editors } = await fetchSevenTvChannelData(channelTwitchId);
  const nameToId = await upsertEmotes(emotes, channelDbId);

  let removedCount = 0;
  if (emotes.length > 0) {
    const keepIds = Array.from(nameToId.values());
    const removed = await prisma.channelEmote.deleteMany({
      where: { channelId: channelDbId, emoteId: { notIn: keepIds } },
    });
    removedCount = removed.count;

    // Drop the channel's counters for emotes it no longer has
    await prisma.channelEmoteTotal.deleteMany({
      where: { channelId: channelDbId, emoteId: { notIn: keepIds } },
    });
    await prisma.emoteUsageDaily.deleteMany({
      where: { channelId: channelDbId, emoteId: { notIn: keepIds } },
    });
    await prisma.emoteUsage.deleteMany({
      where: { channelId: channelDbId, emoteId: { notIn: keepIds } },
    });
  }

  // Remove editors no longer listed
  await prisma.channelEditor.deleteMany({
    where: {
      channelId: channelDbId,
      sevenTvUserId: { notIn: editors.map((e) => e.id) },
    },
  });

  await prisma.channel.update({
    where: { id: channelDbId },
    data: { sevenTvEmoteSetId: emoteSetId, lastEmoteRefresh: new Date() },
  });

  channelEmoteCache.set(channelLogin.toLowerCase(), nameToId);
  console.log(
    `[emotes] cached ${nameToId.size} channel emotes for #${channelLogin}` +
      (removedCount > 0 ? ` (${removedCount} removed)` : "")
  );

  return emoteSetId;
}

export async function refreshGlobalEmotes() {
  const emotes = await fetchSevenTvGlobalEmotes();
  globalEmoteCache = await upsertEmotes(emotes, null);
  console.log(`[emotes] cached ${globalEmoteCache.size} global emotes`);
}

export function resolveEmoteId(channelLogin: string, word: string): string | undefined {
  const channelMap = channelEmoteCache.get(channelLogin.toLowerCase());
  const fromChannel = channelMap?.get(word);
  if (fromChannel) return fromChannel;
  return globalEmoteCache?.get(word);
}