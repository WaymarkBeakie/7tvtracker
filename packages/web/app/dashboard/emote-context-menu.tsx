"use client";

import { useEffect, useRef } from "react";
import { BarChart3, ExternalLink, Copy } from "lucide-react";

export type ContextMenuState = {
  x: number;
  y: number;
  emote: { id: string; name: string; sevenTvId: string };
} | null;

export function EmoteContextMenu({
  state,
  onClose,
  onOpenPanel,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onOpenPanel: (emoteId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) return;

    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onScroll() {
      onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [state, onClose]);

  if (!state) return null;

  const MENU_W = 180;
  const MENU_H = 120;
  const x = Math.min(state.x, window.innerWidth - MENU_W - 8);
  const y = Math.min(state.y, window.innerHeight - MENU_H - 8);

  const itemClass =
    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400";

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-[60] w-44 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 py-1 shadow-xl"
    >
      <a href={`https://7tv.app/emotes/${state.emote.sevenTvId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass}
        onClick={onClose}
      >
        <span>Open on 7TV</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>

      <button
        className={itemClass}
        onClick={() => {
          onOpenPanel(state.emote.id);
          onClose();
        }}
      >
        <span>View stats</span>
        <BarChart3 className="h-3.5 w-3.5 shrink-0" />
      </button>

      <button
        className={itemClass}
        onClick={() => {
          navigator.clipboard.writeText(state.emote.name);
          onClose();
        }}
      >
        <span>Copy name</span>
        <Copy className="h-3.5 w-3.5 shrink-0" />
      </button>
    </div>
  );
}