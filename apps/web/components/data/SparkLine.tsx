"use client";

import { useState } from "react";
import { ChartTooltip } from "./ChartTooltip";
import type { StreakHistoryPoint } from "./types";

export function SparkLine({
  data = [],
  height = 48,
  stroke = "var(--accent-gold)",
}: {
  data?: StreakHistoryPoint[];
  height?: number;
  stroke?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const w = 260;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data.map((d, i) => {
    const x = i * step;
    const y = height - (d.count / max) * (height - 8) - 4;
    return { x, y, xPct: (x / w) * 100, yPct: (y / height) * 100 };
  });
  const pts = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ position: "relative", height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <polyline points={pts} fill="none" stroke={stroke} strokeWidth={2} />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={points[i].x}
            cy={points[i].y}
            r={active === i ? 4 : i === data.length - 1 ? 3 : 0}
            fill={stroke}
          />
        ))}
      </svg>
      {data.map((d, i) => (
        <div
          key={`hit-${i}`}
          title={`${d.date}: ${d.count}`}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
          onClick={() => setActive((cur) => (cur === i ? null : i))}
          style={{
            position: "absolute",
            left: `${points[i].xPct}%`,
            top: `${points[i].yPct}%`,
            width: 16,
            height: 16,
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
          }}
        />
      ))}
      {active !== null && (
        <ChartTooltip xPercent={points[active].xPct} yPercent={points[active].yPct}>
          {data[active].date} · {data[active].count}
        </ChartTooltip>
      )}
    </div>
  );
}
