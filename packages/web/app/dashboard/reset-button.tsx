"use client";

import { useState, useTransition, useEffect } from "react";
import { resetChannelStats } from "../actions";

export function ResetButton({ channelLogin }: { channelLogin?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Close on Escape
  useEffect(() => {
    if (!confirming) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isPending) setConfirming(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirming, isPending]);

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/50"
        >
          Reset all stats
        </button>
        {message && <span className="text-xs text-neutral-500">{message}</span>}
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !isPending && setConfirming(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-white">Reset all stats?</h3>
            <p className="mt-3 text-sm text-neutral-400">
              This permanently deletes all emote usage history for this channel. Every count
              returns to zero and the data cannot be recovered.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await resetChannelStats(channelLogin);
                    setMessage(result.message);
                    setConfirming(false);
                  })
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isPending ? "Deleting…" : "Delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}