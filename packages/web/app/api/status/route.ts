import { NextResponse } from "next/server";
import { prisma } from "@emotetracker/db";
import { resolveChannelAccess } from "@/lib/channel-access";

export async function GET(req: Request) {
  const login = new URL(req.url).searchParams.get("channel") ?? undefined;
  const access = await resolveChannelAccess(login);
  if (!access) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const dayAgo = new Date(Date.now() - 24 * 3_600_000);

  const heartbeats = await prisma.botHeartbeat.findMany({
    where: { channelId: access.channel.id, at: { gte: dayAgo } },
    select: { at: true },
    orderBy: { at: "asc" },
  });

  const EXPECTED_PER_HOUR = 12;
  const uptime = Array.from({ length: 24 }, (_, i) => {
    const slotStart = new Date(Date.now() - (23 - i) * 3_600_000);
    slotStart.setMinutes(0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 3_600_000);
    const seen = heartbeats.filter((h) => h.at >= slotStart && h.at < slotEnd).length;
    return {
      hour: slotStart.getUTCHours(),
      pct: Math.min(100, Math.round((seen / EXPECTED_PER_HOUR) * 100)),
    };
  });

  return NextResponse.json({
    botEnabled: access.channel.botEnabled,
    lastSeen: heartbeats.length > 0 ? heartbeats[heartbeats.length - 1].at.toISOString() : null,
    uptime,
  });
}