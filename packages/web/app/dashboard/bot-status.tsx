type Status = "healthy" | "stale" | "unknown" | "disabled";

function getStatus(botEnabled: boolean, lastRefresh: Date | null): Status {
  if (!botEnabled) return "disabled";
  if (!lastRefresh) return "unknown";

  const hoursSince = (Date.now() - lastRefresh.getTime()) / 3_600_000;
  // The bot refreshes every 6h, so anything under ~8h is expected
  return hoursSince < 8 ? "healthy" : "stale";
}

const STATUS_META: Record<Status, { dot: string; label: string; note: string }> = {
  healthy: {
    dot: "bg-emerald-400",
    label: "Active",
    note: "Tracking emote usage in this chat.",
  },
  stale: {
    dot: "bg-amber-400",
    label: "Not syncing",
    note: "The bot hasn't synced emotes recently. It may be offline.",
  },
  unknown: {
    dot: "bg-neutral-500",
    label: "Waiting",
    note: "Enabled, but hasn't synced yet.",
  },
  disabled: {
    dot: "bg-neutral-600",
    label: "Disabled",
    note: "The bot is not joined to this chat.",
  },
};

function formatRelative(date: Date | null) {
  if (!date) return "Never";
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function BotStatus({
  botEnabled,
  lastRefresh,
  emoteCount,
}: {
  botEnabled: boolean;
  lastRefresh: Date | null;
  emoteCount: number;
}) {
  const status = getStatus(botEnabled, lastRefresh);
  const meta = STATUS_META[status];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {status === "healthy" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          )}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${meta.dot}`} />
        </span>
        <span className="text-sm font-medium">{meta.label}</span>
      </div>

      <p className="text-sm text-neutral-400">{meta.note}</p>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Tracked emotes</dt>
          <dd className="font-mono text-neutral-300">{emoteCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Last sync</dt>
          <dd className="text-neutral-300">{formatRelative(lastRefresh)}</dd>
        </div>
      </dl>
    </div>
  );
}