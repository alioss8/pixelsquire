"use client";

import { useState } from "react";
import { ChartTooltip } from "./ChartTooltip";
import type { StreakHistoryPoint } from "./types";

const WEEKDAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

type ActiveBar = { x: number; y: number; label: string; count: number } | null;

export function BarComparison({
  thisWeek = [],
  lastWeek = [],
}: {
  thisWeek?: StreakHistoryPoint[];
  lastWeek?: StreakHistoryPoint[];
}) {
  const [active, setActive] = useState<ActiveBar>(null);
  const max = Math.max(1, ...thisWeek.map((d) => d.count), ...lastWeek.map((d) => d.count));
  const barW = 14;
  const gap = 6;
  const groupGap = 18;
  const groupW = barW * 2 + gap;
  const w = thisWeek.length * (groupW + groupGap);
  const h = 96;
  const vh = h + 20;

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" height={vh} viewBox={`0 0 ${w} ${vh}`} preserveAspectRatio="none">
        {thisWeek.map((d, i) => {
          const x = i * (groupW + groupGap);
          const lw = lastWeek[i]?.count ?? 0;
          const lastBarY = h - (lw / max) * h;
          const lastBarH = (lw / max) * h;
          const thisBarY = h - (d.count / max) * h;
          const thisBarH = (d.count / max) * h;
          const label = WEEKDAYS[i % 7];
          return (
            <g key={i}>
              <rect
                x={x}
                y={lastBarY}
                width={barW}
                height={Math.max(lastBarH, 1)}
                fill="var(--text-muted)"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setActive({ x: x + barW / 2, y: lastBarY, label: `${label} · geçen hafta`, count: lw })}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive({ x: x + barW / 2, y: lastBarY, label: `${label} · geçen hafta`, count: lw })}
              />
              <rect
                x={x + barW + gap}
                y={thisBarY}
                width={barW}
                height={Math.max(thisBarH, 1)}
                fill="var(--accent-gold)"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setActive({ x: x + barW + gap + barW / 2, y: thisBarY, label: `${label} · bu hafta`, count: d.count })}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive({ x: x + barW + gap + barW / 2, y: thisBarY, label: `${label} · bu hafta`, count: d.count })}
              />
              <text
                x={x + groupW / 2}
                y={h + 14}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-body)"
                fill="var(--text-secondary)"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      {active && (
        <ChartTooltip xPercent={(active.x / w) * 100} yPercent={(active.y / vh) * 100}>
          {active.label}: {active.count}
        </ChartTooltip>
      )}
    </div>
  );
}
