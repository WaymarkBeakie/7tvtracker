"use server";

import { prisma } from "@emotetracker/db";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { requireOwner  } from "@/lib/channel-access";

export async function setTimezone(timezone: string, channelLogin?: string) {
  const access = await requireOwner(channelLogin);
  if (!access) throw new Error("Not authorized");

  // Validate against the runtime's own timezone database
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    return { ok: false, message: "Unrecognised timezone." };
  }

  await prisma.channel.update({
    where: { id: access.channel.id },
    data: { timezone },
  });

  revalidatePath(channelLogin ? `/dashboard/${channelLogin}` : "/dashboard");
  return { ok: true, message: "Timezone saved." };
}

export async function exportCsv(channelLogin?: string) {
  const access = await requireOwner(channelLogin);
  if (!access) throw new Error("Not authorized");

  const channelId = access.channel.id;

  const [totals, daily] = await Promise.all([
    prisma.channelEmoteTotal.findMany({
      where: { channelId },
      include: { emote: true },
    }),
    prisma.emoteUsageDaily.findMany({
      where: { channelId },
      include: { emote: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const lines: string[] = [];
  lines.push("type,emote_name,seven_tv_id,date,count");

  for (const t of totals) {
    lines.push(`total,${csvEscape(t.emote.name)},${t.emote.sevenTvId},,${t.count}`);
  }
  for (const d of daily) {
    lines.push(
      `daily,${csvEscape(d.emote.name)},${d.emote.sevenTvId},${d.date
        .toISOString()
        .slice(0, 10)},${d.count}`
    );
  }

  return { csv: lines.join("\n"), filename: `${access.channel.login}-emotes.csv` };
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function syncEditors(channelLogin?: string) {
  const access = await requireOwner(channelLogin);
  if (!access) throw new Error("Not authorized");

  const res = await fetch(`https://7tv.io/v3/users/twitch/${access.channel.twitchId}`);
  if (!res.ok) {
    return { ok: false, message: `7TV API error (${res.status})` };
  }

  const data = await res.json();
  const editors: { id: string; permissions: number; added_at: number }[] =
    data.user?.editors ?? [];

  for (const ed of editors) {
    await prisma.channelEditor.upsert({
      where: {
        channelId_sevenTvUserId: {
          channelId: access.channel.id,
          sevenTvUserId: ed.id,
        },
      },
      update: { permissions: ed.permissions },
      create: {
        channelId: access.channel.id,
        sevenTvUserId: ed.id,
        permissions: ed.permissions,
        addedAt: new Date(ed.added_at),
      },
    });
  }

  const removed = await prisma.channelEditor.deleteMany({
    where: {
      channelId: access.channel.id,
      sevenTvUserId: { notIn: editors.map((e) => e.id) },
    },
  });

  revalidatePath(channelLogin ? `/dashboard/${channelLogin}/settings` : "/dashboard/settings");
  return {
    ok: true,
    message: `Synced ${editors.length} editor(s)${removed.count > 0 ? `, removed ${removed.count}` : ""}.`,
  };
}

export async function deleteAccount() {
  const access = await requireOwner();
  if (!access) throw new Error("Not authorized");

  const channelId = access.channel.id;

  await prisma.$transaction([
    prisma.emoteUsage.deleteMany({ where: { channelId } }),
    prisma.emoteUsageDaily.deleteMany({ where: { channelId } }),
    prisma.channelEmoteTotal.deleteMany({ where: { channelId } }),
    prisma.channelEditor.deleteMany({ where: { channelId } }),
    prisma.emote.deleteMany({ where: { channelId } }),
    prisma.channel.delete({ where: { id: channelId } }),
  ]);

  const user = await prisma.user.findFirst({ where: { channel: null } });
  if (user) {
    await prisma.user.delete({ where: { id: user.id } });
  }

  await signOut({ redirectTo: "/" });
}