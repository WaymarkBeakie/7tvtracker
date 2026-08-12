import { redirect } from "next/navigation";
import { resolveChannelAccess } from "@/lib/channel-access";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage() {
  const access = await resolveChannelAccess();
  if (!access) redirect("/");

  return <DashboardView access={access} />;
}