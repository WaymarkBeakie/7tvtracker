"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBot } from "../actions";

export function BotToggle({
  enabled,
  channelLogin,
}: {
  enabled: boolean;
  channelLogin?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleBot(!enabled, channelLogin);
          router.refresh();
        })
      }
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        enabled
          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
      }`}
    >
      {isPending
        ? enabled
          ? "Disabling…"
          : "Fetching emotes…"
        : enabled
          ? "Bot Enabled"
          : "Enable Bot"}
    </button>
  );
}