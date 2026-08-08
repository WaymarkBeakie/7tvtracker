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
      create: { sevenTvId: e.id, name: e.name, channelId: channelDbId },
    });
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

  const activeSevenTvIds = emotes.map((e) => e.id);

  let deletedCount = 0;
  if (activeSevenTvIds.length > 0) {
    const deleted = await prisma.emote.deleteMany({
      where: { channelId: channelDbId, sevenTvId: { notIn: activeSevenTvIds } },
    });
    deletedCount = deleted.count;
  }

  await prisma.channel.update({
    where: { id: channelDbId },
    data: { sevenTvEmoteSetId: emoteSetId, lastEmoteRefresh: new Date() },
  });

  channelEmoteCache.set(channelLogin.toLowerCase(), nameToId);
  console.log(
    `[emotes] cached ${nameToId.size} channel emotes for #${channelLogin}` +
      (deletedCount > 0 ? ` (${deletedCount} removed)` : "")
  );

    // Sync editors
  for (const editor of editors) {
    await prisma.channelEditor.upsert({
      where: {
        channelId_sevenTvUserId: { channelId: channelDbId, sevenTvUserId: editor.id },
      },
      update: { permissions: editor.permissions },
      create: {
        channelId: channelDbId,
        sevenTvUserId: editor.id,
        permissions: editor.permissions,
        addedAt: new Date(editor.added_at),
      },
    });
  }

  // Remove editors no longer listed
  await prisma.channelEditor.deleteMany({
    where: {
      channelId: channelDbId,
      sevenTvUserId: { notIn: editors.map((e) => e.id) },
    },
  });

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