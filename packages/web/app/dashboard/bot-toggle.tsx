"use client";

import { useTransition } from "react";
import { toggleBot } from "../actions";

export function BotToggle({ enabled, channelLogin }: { enabled: boolean; channelLogin?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleBot(!enabled, channelLogin))}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        enabled
          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
      }`}
    >
      {isPending ? "Updating…" : enabled ? "Bot Enabled" : "Enable Bot"}
    </button>
  );
}