"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Image from "next/image";
import { getEmoteStats } from "../actions";
import { UsageChart } from "./usage-chart";
import { RefreshButton } from "./refresh-button";
import { ResetButton } from "./reset-button";

type EmoteSummary = { id: string; name: string; sevenTvId: string; count: number };
type EmoteStats = {
  dailyUsage: { date: string; count: number }[];
};

const DAY_OPTIONS = [7, 14, 30, 90];
const PAGE_SIZE = 20;
type SortOption = "most" | "least" | "az";

function emoteThumbUrl(sevenTvId: string) {
  return `https://cdn.7tv.app/emote/${sevenTvId}/1x.webp`;
}
function emoteFullUrl(sevenTvId: string) {
  return `https://cdn.7tv.app/emote/${sevenTvId}/2x.webp`;
}

export function EmoteGrid({
  emotes,
  channelLogin,
}: {
  emotes: EmoteSummary[];
  channelLogin?: string;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("most");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<EmoteSummary | null>(null);
  const [days, setDays] = useState(14);
  const [stats, setStats] = useState<EmoteStats | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEmotes = useMemo(() => {
    let result = emotes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      if (sort === "most") return b.count - a.count;
      if (sort === "least") return a.count - b.count;
      return a.name.localeCompare(b.name);
    });
  }, [emotes, search, sort]);

  // Reset to page 1 whenever the filtered set changes underneath the current page
  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredEmotes.length / PAGE_SIZE));
  const pageEmotes = filteredEmotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function loadStats(emoteId: string, rangeDays: number) {
    startTransition(async () => {
      const result = await getEmoteStats(emoteId, rangeDays, channelLogin);
      setStats(result);
    });
  }

  function selectEmote(emote: EmoteSummary) {
    setSelected(emote);
    setStats(null);
    setDays(14);
    loadStats(emote.id, 14);
  }

  function changeDays(newDays: number) {
    setDays(newDays);
    if (selected) {
      setStats(null);
      loadStats(selected.id, newDays);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search emotes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none sm:w-64"
        />
        <RefreshButton />
        <ResetButton channelLogin={channelLogin} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">
            {filteredEmotes.length} emote{filteredEmotes.length === 1 ? "" : "s"}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 focus:border-emerald-500/50 focus:outline-none"
          >
            <option value="most">Most used</option>
            <option value="least">Least used</option>
            <option value="az">A–Z</option>
          </select>
        </div>
      </div>

      {pageEmotes.length === 0 ? (
        <p className="text-sm text-neutral-500">No emotes match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {pageEmotes.map((emote) => (
            <button
              key={emote.id}
              onClick={() => selectEmote(emote)}
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-emerald-500/50 hover:bg-neutral-800"
            >
              <Image
                src={emoteThumbUrl(emote.sevenTvId)}
                alt={emote.name}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                loading="lazy"
              />
              <span className="w-full truncate text-center text-xs text-neutral-300">
                {emote.name}
              </span>
              <span className="font-mono text-sm text-emerald-400">{emote.count}</span>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={emoteFullUrl(selected.sevenTvId)}
                  alt={selected.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h3 className="font-medium">{selected.name}</h3>
                  <p className="text-xs text-neutral-500">{selected.count} total uses</p>
                  
                  <a href={`https://7tv.app/emotes/${selected.sevenTvId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    View on 7TV →
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => changeDays(d)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    days === d
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>

            {isPending || !stats ? (
              <p className="text-sm text-neutral-500">Loading…</p>
            ) : (
              <section>
                <h4 className="mb-3 text-sm font-medium text-neutral-400">
                  Usage (last {days} days)
                </h4>
                <UsageChart data={stats.dailyUsage} />
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}