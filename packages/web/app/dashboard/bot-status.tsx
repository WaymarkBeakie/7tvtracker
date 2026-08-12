"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Status = "online" | "offline" | "unknown" | "disabled";

function getStatus(botEnabled: boolean, lastSeen: Date | null): Status {
  if (!botEnabled) return "disabled";
  if (!lastSeen) return "unknown";
  const minsSince = (Date.now() - lastSeen.getTime()) / 60_000;
  // Heartbeat is every 5 minutes, so 12 allows for a couple of misses
  return minsSince < 12 ? "online" : "offline";
}

const STATUS_META: Record<Status, { dot: string; label: string; note: string }> = {
  online: {
    dot: "bg-emerald-400",
    label: "Online",
    note: "Tracking emote usage in this chat.",
  },
  offline: {
    dot: "bg-red-400",
    label: "Offline",
    note: "The bot hasn't checked in recently.",
  },
  unknown: {
    dot: "bg-neutral-500",
    label: "Waiting",
    note: "Enabled, but hasn't connected yet.",
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

function barColor(pct: number, tracked: boolean) {
  if (pct >= 90) return "bg-emerald-500/70";
  if (pct >= 50) return "bg-amber-500/70";
  if (pct > 0) return "bg-red-500/70";
  return "bg-neutral-800";
}

export function BotStatus({
  botEnabled,
  lastSeen,
  uptime,
  toggle
}: {
  botEnabled: boolean;
  lastSeen: Date | null;
  uptime: { hour: number; pct: number }[];
  toggle?: React.ReactNode;
}) {

  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(id);
  }, [router]);
  
  const status = getStatus(botEnabled, lastSeen);
  const meta = STATUS_META[status];

  // Only average from the first hour we ever saw a heartbeat
  const firstActiveIndex = uptime.findIndex((u) => u.pct > 0);
  const measured = firstActiveIndex === -1 ? [] : uptime.slice(firstActiveIndex);
  const avg =
    measured.length > 0
      ? Math.round(measured.reduce((sum, u) => sum + u.pct, 0) / measured.length)
      : 0;

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {status === "online" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${meta.dot}`} />
          </span>
          <span className="text-sm font-medium">{meta.label}</span>
          <span className="text-xs text-neutral-500">· {formatRelative(lastSeen)}</span>
        </div>
        {toggle}
      </div>

      <p className="text-sm text-neutral-400">{meta.note}</p>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs text-neutral-500">Last 24 hours</span>
          <span className="font-mono text-xs text-neutral-400">{avg}% uptime</span>
        </div>
        <div className="flex h-8 items-end gap-[2px]">
          {uptime.map((u, i) => {
            const tracked = firstActiveIndex !== -1 && i >= firstActiveIndex;
            return (
              <div
                key={i}
                title={
                  tracked
                    ? `${String(u.hour).padStart(2, "0")}:00 UTC — ${u.pct}%`
                    : "No data"
                }
                className={`flex-1 rounded-sm ${barColor(u.pct, tracked)}`}
                style={{ height: `${Math.max(8, u.pct)}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}