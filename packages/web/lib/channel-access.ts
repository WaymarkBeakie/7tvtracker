import { auth } from "@/auth";
import { prisma } from "@emotetracker/db";

export type ChannelAccess = {
  channel: {
    id: string;
    login: string;
    twitchId: string;
    botEnabled: boolean;
    timezone: string;
    ownerId: string;
  };
  isOwner: boolean;
};

/**
 * Resolves a channel the current user is allowed to access.
 * If channelLogin is omitted, returns the user's own channel.
 * Returns null if not authenticated or not authorized.
 */
export async function resolveChannelAccess(
  channelLogin?: string
): Promise<ChannelAccess | null> {
  const session = await auth();
  const twitchId = (session as any)?.twitchId;
  if (!twitchId) return null;

  const user = await prisma.user.findUnique({
    where: { twitchId },
    include: { channel: true },
  });
  if (!user) return null;

  // No login specified → their own channel
  if (!channelLogin) {
    if (!user.channel) return null;
    return { channel: user.channel, isOwner: true };
  }

  const target = await prisma.channel.findFirst({
    where: { login: { equals: channelLogin.toLowerCase(), mode: "insensitive" } },
  });
  if (!target) return null;

  if (user.channel?.id === target.id) {
    return { channel: target, isOwner: true };
  }

  if (!user.sevenTvId) return null;

  const editorRow = await prisma.channelEditor.findUnique({
    where: {
      channelId_sevenTvUserId: {
        channelId: target.id,
        sevenTvUserId: user.sevenTvId,
      },
    },
  });
  if (!editorRow) return null;

  return { channel: target, isOwner: false };
}

/**
 * Like resolveChannelAccess, but only succeeds for the channel owner.
 * Use for any mutating or settings-related action.
 */
export async function requireOwner(channelLogin?: string): Promise<ChannelAccess | null> {
  const access = await resolveChannelAccess(channelLogin);
  if (!access || !access.isOwner) return null;
  return access;
}