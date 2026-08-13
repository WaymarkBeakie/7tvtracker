"use client";

import { useMemo, useState, useTransition } from "react";
import { setTimezone, exportCsv, syncEditors, deleteAccount, setUptimeChartStyle } from "../settings-actions";
import { resetChannelStats } from "../actions";

const TIMEZONE_OPTIONS: { zone: string; city: string }[] = [
  { zone: "UTC", city: "UTC" },
  { zone: "Pacific/Honolulu", city: "Honolulu" },
  { zone: "America/Anchorage", city: "Anchorage" },
  { zone: "America/Los_Angeles", city: "Los Angeles" },
  { zone: "America/Denver", city: "Denver" },
  { zone: "America/Chicago", city: "Chicago" },
  { zone: "America/New_York", city: "New York" },
  { zone: "America/Sao_Paulo", city: "São Paulo" },
  { zone: "Europe/London", city: "London" },
  { zone: "Europe/Paris", city: "Paris" },
  { zone: "Europe/Berlin", city: "Berlin" },
  { zone: "Europe/Stockholm", city: "Stockholm" },
  { zone: "Europe/Moscow", city: "Moscow" },
  { zone: "Asia/Dubai", city: "Dubai" },
  { zone: "Asia/Kolkata", city: "Mumbai" },
  { zone: "Asia/Bangkok", city: "Bangkok" },
  { zone: "Asia/Singapore", city: "Singapore" },
  { zone: "Asia/Shanghai", city: "Shanghai" },
  { zone: "Asia/Seoul", city: "Seoul" },
  { zone: "Asia/Tokyo", city: "Tokyo" },
  { zone: "Australia/Perth", city: "Perth" },
  { zone: "Australia/Brisbane", city: "Brisbane" },
  { zone: "Australia/Sydney", city: "Sydney" },
  { zone: "Pacific/Auckland", city: "Auckland" },
];

function formatOffset(zone: string) {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longOffset",
    }).formatToParts(now);

    const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    // longOffset yields e.g. "GMT+10:00" or "GMT" for UTC
    if (name === "GMT") return "UTC+0";
    return name.replace("GMT", "UTC").replace(":00", "");
  } catch {
    return "";
  }
}

export function TimezonePanel({
  current,
  channelLogin,
}: {
  current: string;
  channelLogin?: string;
}) {
  const [tz, setTz] = useState(current);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const options = useMemo(
    () =>
      TIMEZONE_OPTIONS.map((o) => ({
        ...o,
        label: o.zone === "UTC" ? "UTC" : `${o.city} (${formatOffset(o.zone)})`,
      })),
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={tz}
        onChange={(e) => setTz(e.target.value)}
        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 focus:border-emerald-500/50 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.zone} value={o.zone}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        disabled={isPending || tz === current}
        onClick={() =>
          startTransition(async () => {
            const r = await setTimezone(tz, channelLogin);
            setMessage(r.message);
          })
        }
        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
      {message && <span className="text-xs text-neutral-500">{message}</span>}
    </div>
  );
}

export function ChartStylePanel({
  current,
  channelLogin,
}: {
  current: string;
  channelLogin?: string;
}) {
  const [style, setStyle] = useState(current);
  const [isPending, startTransition] = useTransition();

  function pick(next: "bars" | "line") {
    setStyle(next);
    startTransition(() => {
      setUptimeChartStyle(next, channelLogin);
    });
  }

  return (
    <div className="flex gap-2">
      {(["bars", "line"] as const).map((s) => (
        <button
          key={s}
          disabled={isPending}
          onClick={() => pick(s)}
          className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors disabled:opacity-50 ${
            style === s
              ? "bg-emerald-500/15 text-emerald-400"
              : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export function ExportPanel({ channelLogin }: { channelLogin?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const { csv, filename } = await exportCsv(channelLogin);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        })
      }
      className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
    >
      {isPending ? "Generating…" : "Download CSV"}
    </button>
  );
}

export function SyncEditorsPanel({ channelLogin }: { channelLogin?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await syncEditors(channelLogin);
            setMessage(r.message);
          })
        }
        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Syncing…" : "Sync editors now"}
      </button>
      {message && <span className="text-xs text-neutral-500">{message}</span>}
    </div>
  );
}

export function DangerPanel({
  channelLogin,
  isOwner,
}: {
  channelLogin?: string;
  isOwner: boolean;
}) {
  const [confirming, setConfirming] = useState<"reset" | "account" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    confirming === "reset"
      ? {
          title: "Reset all stats?",
          body: "This permanently deletes all emote usage history for this channel. Every count returns to zero and the data cannot be recovered.",
          confirm: "Delete statistics",
          run: async () => {
            const r = await resetChannelStats(channelLogin);
            setMessage(r.message);
            setConfirming(null);
          },
        }
      : {
          title: "Delete account?",
          body: "This removes your channel, all emote data, and your account entirely. The bot will leave your chat and you will be signed out. This cannot be undone.",
          confirm: "Delete everything",
          run: async () => {
            await deleteAccount();
          },
        };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setConfirming("reset")}
          className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/50"
        >
          Reset all stats
        </button>
        {isOwner && (
          <button
            onClick={() => setConfirming("account")}
            className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/50"
          >
            Delete account
          </button>
        )}
        {message && <span className="text-xs text-neutral-500">{message}</span>}
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !isPending && setConfirming(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-white">{copy.title}</h3>
            <p className="mt-3 text-sm text-neutral-400">{copy.body}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirming(null)}
                disabled={isPending}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={() => startTransition(copy.run)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isPending ? "Working…" : copy.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}