import { redirect } from "next/navigation";
import { resolveChannelAccess } from "@/lib/channel-access";
import { SettingsView } from "../settings-view";

export default async function SettingsPage() {
  const access = await resolveChannelAccess();
  if (!access) redirect("/");

  return <SettingsView access={access} />;
}