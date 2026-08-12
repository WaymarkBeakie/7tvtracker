import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireOwner } from "@/lib/channel-access";
import { SettingsView } from "../../settings-view";

export default async function ChannelSettingsPage({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;

  const session = await auth();
  if (!session) redirect("/");

  const access = await requireOwner(login);
  if (!access) notFound();

  return <SettingsView access={access} channelLogin={login} />;
}