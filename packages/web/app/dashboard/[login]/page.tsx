import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveChannelAccess } from "@/lib/channel-access";
import { DashboardView } from "../dashboard-view";

export default async function ChannelDashboardPage({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;

  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  const access = await resolveChannelAccess(login);
  if (!access) notFound();

  return <DashboardView access={access} channelLogin={login} />;
}