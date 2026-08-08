import "dotenv/config";
import tmi from "tmi.js";
import { prisma } from "@emotetracker/db";
import { refreshChannelEmotes, refreshGlobalEmotes, resolveEmoteId } from "./emotes";
import { getValidBotToken } from "./auth";
import { REFRESH_BUFFER_MS } from "./auth";
import { SevenTvEventClient } from "./eventapi";

// Maps 7TV emote set ID -> the channel it belongs to, so dispatches can be routed
const setIdToChannel = new Map<string, { login: string; twitchId: string; dbId: string }>();

const eventClient = new SevenTvEventClient(async (emoteSetId) => {
  const channel = setIdToChannel.get(emoteSetId);
  if (!channel) return;
  console.log(`[7tv-events] refreshing emotes for #${channel.login}`);
  await refreshChannelEmotes(channel.login, channel.twitchId, channel.dbId);
});

const POLL_INTERVAL_MS = 30_000;
const EMOTE_REFRESH_INTERVAL_MS = 10 * 60_000;
const TOKEN_CHECK_INTERVAL_MS = 60_000; // check every minute, refresh only when close to expiry

let client: tmi.Client;
let joinedChannels = new Set<string>();

async function createClient() {
  const token = await getValidBotToken();
  return new tmi.Client({
    options: { debug: true },
    identity: {
      username: process.env.TWITCH_BOT_USERNAME!,
      password: `oauth:${token}`,
    },
    channels: [],
  });
}

function attachHandlers(c: tmi.Client) {
  c.on("connected", () => {
    console.log("[bot] connected to Twitch IRC");
  });

  c.on("message", async (channel, tags, message, self) => {
    if (self) return;

    const channelLogin = channel.replace("#", "").toLowerCase();
    const dbChannel = await prisma.channel.findFirst({
      where: { login: { equals: channelLogin, mode: "insensitive" } },
    });
    if (!dbChannel) return;

    const cleanMessage = message.replace(/[\u034F\u200B-\u200D\uFEFF]/g, "");
    const words = cleanMessage.split(/\s+/);

    for (const word of words) {
      const emoteId = resolveEmoteId(channelLogin, word);
      if (emoteId) {
        await prisma.$transaction([
          prisma.emoteUsage.create({
            data: {
              channelId: dbChannel.id,
              chatterTwitchId: tags["user-id"] ?? "unknown",
              chatterUsername: tags["display-name"] ?? tags.username ?? "unknown",
              emoteId,
            },
          }),
          prisma.channelEmoteTotal.upsert({
            where: { channelId_emoteId: { channelId: dbChannel.id, emoteId } },
            update: { count: { increment: 1 } },
            create: { channelId: dbChannel.id, emoteId, count: 1 },
          }),
        ]);
        console.log(`[emote] ${tags["display-name"]} used ${word} in #${channelLogin}`);
      }
    }
  });
}

async function syncChannels() {
  const activeChannels = await prisma.channel.findMany({
    where: { botEnabled: true },
    select: { id: true, login: true, twitchId: true },
  });

  const desired = new Map(activeChannels.map((c) => [c.login.toLowerCase(), c]));

  for (const [login, channel] of desired) {
    if (!joinedChannels.has(login)) {
      try {
        await client.join(login);
        joinedChannels.add(login);
        const emoteSetId = await refreshChannelEmotes(login, channel.twitchId, channel.id);
        if (emoteSetId) {
          setIdToChannel.set(emoteSetId, { login, twitchId: channel.twitchId, dbId: channel.id });
          eventClient.subscribe(emoteSetId);
        }
        console.log(`[bot] joined #${login}`);
      } catch (err) {
        console.error(`[bot] failed to join #${login}`, err);
      }
    }
  }

  for (const login of joinedChannels) {
    if (!desired.has(login)) {
      try {
        await client.part(login);
        joinedChannels.delete(login);
        // Drop any event subscription tied to this channel
        for (const [setId, ch] of setIdToChannel) {
          if (ch.login === login) {
            eventClient.unsubscribe(setId);
            setIdToChannel.delete(setId);
          }
        }
        console.log(`[bot] left #${login}`);
      } catch (err) {
        console.error(`[bot] failed to part #${login}`, err);
      }
    }
  }
}

async function refreshAllChannelEmotes() {
  const activeChannels = await prisma.channel.findMany({
    where: { botEnabled: true },
    select: { id: true, login: true, twitchId: true },
  });
  for (const channel of activeChannels) {
    await refreshChannelEmotes(channel.login, channel.twitchId, channel.id);
  }
}

async function reconnectWithFreshToken() {
  console.log("[bot] reconnecting with refreshed token...");
  const previouslyJoined = new Set(joinedChannels);

  try {
    await client.disconnect();
  } catch {
    // ignore — may already be disconnected
  }

  client = await createClient();
  attachHandlers(client);
  await client.connect();

  joinedChannels = new Set();
  for (const login of previouslyJoined) {
    await client.join(login);
    joinedChannels.add(login);
  }
  console.log("[bot] reconnected, rejoined", joinedChannels.size, "channel(s)");
}

async function checkTokenAndMaybeReconnect() {
  try {
    const cred = await prisma.botCredential.findUnique({ where: { id: "bot" } });
    if (!cred) {
      console.log("[debug] no credential found, skipping");
      return;
    }

    const expiresInMs = cred.expiresAt.getTime() - Date.now();

    if (expiresInMs <= REFRESH_BUFFER_MS) {
      await getValidBotToken();
      await reconnectWithFreshToken();
    }
  } catch (err) {
    console.error("[bot] token refresh/reconnect failed:", err);
  }
}

async function main() {
  await refreshGlobalEmotes();
  eventClient.connect();

  client = await createClient();
  attachHandlers(client);
  await client.connect();

  await syncChannels();
  setInterval(syncChannels, POLL_INTERVAL_MS);
  setInterval(refreshAllChannelEmotes, EMOTE_REFRESH_INTERVAL_MS);
  setInterval(checkTokenAndMaybeReconnect, TOKEN_CHECK_INTERVAL_MS);
}

main().catch((err) => {
  console.error("[bot] fatal error", err);
  process.exit(1);
});