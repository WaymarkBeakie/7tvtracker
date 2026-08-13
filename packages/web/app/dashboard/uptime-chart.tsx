"use client";

export type UptimeBucket = { hour: number; pct: number };

function barClass(pct: number, tracked: boolean) {
  if (!tracked) return "fill-neutral-900";
  if (pct >= 99) return "fill-emerald-500";
  if (pct >= 90) return "fill-emerald-500/45";
  if (pct >= 50) return "fill-amber-500/70";
  if (pct > 0) return "fill-red-500/70";
  return "fill-neutral-800";
}

function dotColor(pct: number) {
  if (pct >= 99) return "#10b981";
  if (pct > 0) return "#f59e0b";
  return "#ef4444";
}

export function UptimeChart({
  uptime,
  style,
}: {
  uptime: UptimeBucket[];
  style: "bars" | "line";
}) {
  const firstActiveIndex = uptime.findIndex((u) => u.pct > 0);
  const n = uptime.length;
  if (n === 0) return null;

  const points = uptime.map((u, i) => {
    const tracked = firstActiveIndex !== -1 && i >= firstActiveIndex;
    const value = tracked ? u.pct / 100 : 0;
    const slotW = 240 / n;
    return {
      i,
      tracked,
      pct: u.pct,
      hour: u.hour,
      slotW,
      x: i * slotW + slotW / 2,
      barTop: 40 - (0.35 + value * 0.65) * 40,
      lineY: 40 - value * 36 - 2,
      label: tracked
        ? `${String(u.hour).padStart(2, "0")}:00 UTC — ${u.pct}%`
        : "No data",
    };
  });

  if (style === "line") {
    const area =
      points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.lineY}`).join(" ") +
      " L 240 40 L 0 40 Z";

    return (
      <svg viewBox="0 0 240 40" preserveAspectRatio="none" className="h-10 w-full">
        <defs>
          <linearGradient id="uptimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#uptimeFill)" />

        {points.slice(1).map((p, i) => {
          const prev = points[i];
          return (
            <line
              key={`s${p.i}`}
              x1={prev.x}
              y1={prev.lineY}
              x2={p.x}
              y2={p.lineY}
              stroke={dotColor(p.pct)}
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    );
  }

  const gap = 1;
  return (
    <svg viewBox="0 0 240 40" preserveAspectRatio="none" className="h-10 w-full">
      {points.map((p) => (
        <rect
          key={p.i}
          x={p.i * p.slotW + gap / 2}
          y={p.barTop}
          width={p.slotW - gap}
          height={40 - p.barTop}
          rx="1.5"
          className={barClass(p.pct, p.tracked)}
        >
          <title>{p.label}</title>
        </rect>
      ))}
    </svg>
  );
}