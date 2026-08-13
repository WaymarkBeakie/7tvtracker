import { prisma } from "@emotetracker/db";
import type { ChannelAccess } from "@/lib/channel-access";
import {
  TimezonePanel,
  ExportPanel,
  SyncEditorsPanel,
  DangerPanel,
  ChartStylePanel,
} from "./settings-panels";

export async function SettingsView({
  access,
  channelLogin,
}: {
  access: ChannelAccess;
  channelLogin?: string;
}) {
  const channel = await prisma.channel.findUnique({
    where: { id: access.channel.id },
    include: { editors: true, _count: { select: { emotes: true } } },
  });
  if (!channel) return null;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-neutral-950 px-6 py-10 text-white">      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-neutral-400">#{channel.login}</p>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="font-medium">Bot status</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-400">Bot</dt>
              <dd className={channel.botEnabled ? "text-emerald-400" : "text-neutral-500"}>
                {channel.botEnabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Tracked emotes</dt>
              <dd className="font-mono text-neutral-300">{channel._count.emotes}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-400">Last emote sync</dt>
              <dd className="text-neutral-300">
                {channel.lastEmoteRefresh
                  ? channel.lastEmoteRefresh.toISOString().replace("T", " ").slice(0, 16) + " UTC"
                  : "Never"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="font-medium">Timezone</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-400">
            Used for the time-of-day chart. Daily totals are always grouped by UTC day.
          </p>
          <TimezonePanel current={channel.timezone} channelLogin={channelLogin} />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="font-medium">Uptime chart</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-400">
            How the bot&apos;s 24-hour uptime is displayed on the dashboard.
          </p>
          <ChartStylePanel current={channel.uptimeChartStyle} channelLogin={channelLogin} />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="font-medium">Editors</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-400">
            {channel.editors.length === 0
              ? "No 7TV editors found for this channel."
              : `${channel.editors.length} editor(s) have full access to this dashboard.`}
          </p>
          <SyncEditorsPanel channelLogin={channelLogin} />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="font-medium">Export</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-400">
            Download all-time totals and daily counts as CSV.
          </p>
          <ExportPanel channelLogin={channelLogin} />
        </section>

        <section className="rounded-xl border border-red-900/40 bg-red-950/10 p-6">
          <h2 className="font-medium text-red-300">Danger zone</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-400">
            Irreversible actions. There are no backups.
          </p>
          <DangerPanel channelLogin={channelLogin} isOwner={access.isOwner} />
        </section>
      </div>
    </main>
  );
}