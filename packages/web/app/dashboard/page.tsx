import { redirect } from "next/navigation";
import { prisma } from "@emotetracker/db";
import { auth } from "@/auth";
import { resolveChannelAccess } from "@/lib/channel-access";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage() {
  const access = await resolveChannelAccess();
  if (!access) redirect("/");

  const session = await auth();
  console.log("[debug] session twitchId:", (session as any)?.twitchId);

  const user = await prisma.user.findUnique({
    where: { twitchId: (session as any).twitchId },
  });
  console.log("[debug] user found:", user?.login, "sevenTvId:", user?.sevenTvId);

  const editableChannels = user?.sevenTvId
    ? await prisma.channelEditor.findMany({
        where: { sevenTvUserId: user.sevenTvId },
        include: { channel: true },
      })
    : [];

  console.log("[debug] editableChannels count:", editableChannels.length);

  return <DashboardView access={access} />
}