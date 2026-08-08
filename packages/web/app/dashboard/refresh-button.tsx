"use client";

import { useState, useTransition } from "react";
import { refreshEmotes } from "../actions";

export function RefreshButton({ channelLogin }: { channelLogin?: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await refreshEmotes(channelLogin);
            setMessage(result.message);
          })
        }
        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Syncing…" : "Refresh emotes"}
      </button>
      {message && <span className="text-xs text-neutral-500">{message}</span>}
    </div>
  );
}