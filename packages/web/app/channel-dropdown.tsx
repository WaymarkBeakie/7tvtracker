"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function ChannelDropdown({
  channels,
}: {
  channels: { id: string; login: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
      >
        Channels you edit
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 py-1 shadow-lg">
          {channels.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/${c.login}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400"
            >
              #{c.login}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}