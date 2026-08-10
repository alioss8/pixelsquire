"use client";

import { useState } from "react";
import type { StreakHistoryPoint } from "./types";

const LEVELS = [
  "var(--surface-card-border)",
  "rgba(224,164,88,0.35)",
  "rgba(224,164,88,0.55)",
  "rgba(224,164,88,0.8)",
  "var(--accent-gold)",
];

function heatColor(count: number, max: number) {
  if (count === 0) return LEVELS[0];
  const r = count / max;
  if (r <= 0.25) return LEVELS[1];
  if (r <= 0.5) return LEVELS[2];
  if (r <= 0.75) return LEVELS[3];
  return LEVELS[4];
}

export function Heatmap({ history = [] }: { history?: StreakHistoryPoint[] }) {
  const [active, setActive] = useState<string | null>(null);

  if (history.length === 0) return null;
  const max = Math.max(1, ...history.map((h) => h.count));
  const firstWeekday = new Date(history[0].date + "T00:00:00Z").getUTCDay();
  const padded: (StreakHistoryPoint | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...history,
  ];
  const weeks: (StreakHistoryPoint | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          gap: 4,
          width: "100%",
          paddingTop: 24,
        }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {week.map((day, di) => {
              const key = `${wi}-${di}`;
              return (
                <div key={di} style={{ position: "relative" }}>
                  <div
                    onMouseEnter={() => day && setActive(key)}
                    onMouseLeave={() => setActive((cur) => (cur === key ? null : cur))}
                    onClick={() => day && setActive((cur) => (cur === key ? null : key))}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      cursor: day ? "pointer" : "default",
                      background: day ? heatColor(day.count, max) : "transparent",
                    }}
                  />
                  {day && active === key && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginBottom: 6,
                        background: "var(--surface-card)",
                        border: "1px solid var(--surface-card-border)",
                        borderRadius: "var(--radius-none)",
                        padding: "4px 8px",
                        fontSize: 11,
                        fontFamily: "var(--font-body)",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 2,
                        boxShadow: "var(--shadow-soft)",
                      }}
                    >
                      {day.date} · {day.count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)" }}>
        <span>az</span>
        {LEVELS.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, background: c }} />
        ))}
        <span>çok</span>
      </div>
    </div>
  );
}
