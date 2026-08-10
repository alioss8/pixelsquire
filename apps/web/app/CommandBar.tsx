"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WOOD = "#241811";
const WOOD_LIGHT = "#3a2a1c";
const GOLD = "#e0a458";
const PARCHMENT = "#f3e6d0";
const MUTED = "#8a7860";

type StreakHistoryPoint = { date: string; count: number };

type StreakStatusData = { streak?: number; history?: StreakHistoryPoint[] };
type CreateGoalData = {
  ok: boolean;
  goal?: { id: string; title: string; cadence: string };
  message?: string;
};
type CheckinData = {
  ok: boolean;
  goal?: string;
  streak?: number;
  message?: string;
};
type UnknownData = { message?: string; suggestions?: string[] };
type DayReviewData = {
  date?: string;
  completed?: { id: string; title: string }[];
  total?: number;
};
type WeeklyReviewData = { history?: StreakHistoryPoint[] };
type StreakAnalysisData = { history?: StreakHistoryPoint[] };
type CompareData = {
  thisWeek?: StreakHistoryPoint[];
  lastWeek?: StreakHistoryPoint[];
  thisWeekTotal?: number;
  lastWeekTotal?: number;
};
type SuggestGoalData = {
  ok: boolean;
  title?: string;
  reason?: string;
  message?: string;
};
type TalkToKnightData = { reply?: string };

type IntentResult = { intent: string; data?: unknown };

export function CommandBar() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<IntentResult | null>(null);

  async function runCommand() {
    const res = await fetch("/api/v1/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: input }),
    });
    const data: IntentResult = await res.json();
    setResult(data);
  }

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runCommand();
        }}
        placeholder="Şövalyeye bir şey söyle..."
      />
      {result?.intent === "STREAK_STATUS" &&
        (() => {
          const data = result.data as StreakStatusData | undefined;
          return (
            <StreakStatusTile
              streak={data?.streak ?? 0}
              history={data?.history ?? []}
            />
          );
        })()}
      {result?.intent === "CREATE_GOAL" &&
        (() => {
          const data = result.data as CreateGoalData | undefined;
          return (
            <GoalCreatedTile
              ok={data?.ok ?? false}
              goal={data?.goal}
              message={data?.message}
            />
          );
        })()}
      {result?.intent === "CHECKIN" &&
        (() => {
          const data = result.data as CheckinData | undefined;
          return (
            <CheckinTile
              ok={data?.ok ?? false}
              goal={data?.goal}
              streak={data?.streak}
              message={data?.message}
            />
          );
        })()}
      {result?.intent === "UNKNOWN" &&
        (() => {
          const data = result.data as UnknownData | undefined;
          return (
            <UnknownTile
              message={data?.message}
              suggestions={data?.suggestions ?? []}
            />
          );
        })()}
      {result?.intent === "DAY_REVIEW" &&
        (() => {
          const data = result.data as DayReviewData | undefined;
          return (
            <DayReviewTile
              date={data?.date ?? ""}
              completed={data?.completed ?? []}
              total={data?.total ?? 0}
            />
          );
        })()}
      {result?.intent === "WEEKLY_REVIEW" &&
        (() => {
          const data = result.data as WeeklyReviewData | undefined;
          return <WeeklyReviewTile history={data?.history ?? []} />;
        })()}
      {result?.intent === "STREAK_ANALYSIS" &&
        (() => {
          const data = result.data as StreakAnalysisData | undefined;
          return <StreakAnalysisTile history={data?.history ?? []} />;
        })()}
      {result?.intent === "COMPARE" &&
        (() => {
          const data = result.data as CompareData | undefined;
          return (
            <CompareTile
              thisWeek={data?.thisWeek ?? []}
              lastWeek={data?.lastWeek ?? []}
              thisWeekTotal={data?.thisWeekTotal ?? 0}
              lastWeekTotal={data?.lastWeekTotal ?? 0}
            />
          );
        })()}
      {result?.intent === "SUGGEST_GOAL" &&
        (() => {
          const data = result.data as SuggestGoalData | undefined;
          return (
            <SuggestGoalTile
              ok={data?.ok ?? false}
              title={data?.title}
              reason={data?.reason}
              message={data?.message}
            />
          );
        })()}
      {result?.intent === "TALK_TO_KNIGHT" &&
        (() => {
          const data = result.data as TalkToKnightData | undefined;
          return <TalkToKnightTile reply={data?.reply} />;
        })()}
      {result &&
        ![
          "STREAK_STATUS",
          "CREATE_GOAL",
          "CHECKIN",
          "UNKNOWN",
          "DAY_REVIEW",
          "WEEKLY_REVIEW",
          "STREAK_ANALYSIS",
          "COMPARE",
          "SUGGEST_GOAL",
          "TALK_TO_KNIGHT",
        ].includes(result.intent) && (
          <pre>{JSON.stringify(result, null, 2)}</pre>
        )}
    </div>
  );
}

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: WOOD,
        border: `2px solid ${WOOD_LIGHT}`,
        borderRadius: 0,
        padding: 16,
        marginTop: 8,
        fontFamily: "monospace",
        color: PARCHMENT,
      }}
    >
      {children}
    </div>
  );
}

function StreakStatusTile({
  streak,
  history,
}: {
  streak: number;
  history: StreakHistoryPoint[];
}) {
  return (
    <Tile>
      <p style={{ margin: 0 }}>{streak} gündür yoldayız kral! ⚔️</p>
      <div style={{ height: 48, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip
              contentStyle={{
                background: WOOD,
                border: `1px solid ${WOOD_LIGHT}`,
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 12,
                color: PARCHMENT,
              }}
              labelStyle={{ color: PARCHMENT }}
              itemStyle={{ color: GOLD }}
              formatter={(value) => [`${value}`, "check-in"]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={GOLD}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: GOLD, stroke: WOOD, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Tile>
  );
}

function DayReviewTile({
  date,
  completed,
  total,
}: {
  date: string;
  completed: { id: string; title: string }[];
  total: number;
}) {
  const ratio = total > 0 ? completed.length / total : 0;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  return (
    <Tile>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <svg width={64} height={64} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
          <circle
            cx={32}
            cy={32}
            r={radius}
            fill="none"
            stroke={WOOD_LIGHT}
            strokeWidth={8}
          />
          <circle
            cx={32}
            cy={32}
            r={radius}
            fill="none"
            stroke={GOLD}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
          />
          <text
            x={32}
            y={36}
            textAnchor="middle"
            fontSize={13}
            fontFamily="monospace"
            fill={PARCHMENT}
          >
            {completed.length}/{total}
          </text>
        </svg>
        <div>
          <p style={{ margin: 0 }}>{date} özeti:</p>
          {completed.length === 0 ? (
            <p style={{ margin: "4px 0 0", opacity: 0.7 }}>
              Hiç quest tamamlanmamış kral.
            </p>
          ) : (
            <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
              {completed.map((g) => (
                <li key={g.id}>{g.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Tile>
  );
}

function WeeklyReviewTile({ history }: { history: StreakHistoryPoint[] }) {
  return (
    <Tile>
      <p style={{ margin: 0 }}>Son 7 gün:</p>
      <div style={{ height: 96, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history}>
            <XAxis
              dataKey="date"
              tickFormatter={weekdayLabel}
              tick={{ fill: PARCHMENT, fontSize: 10 }}
              axisLine={{ stroke: WOOD_LIGHT }}
              tickLine={false}
            />
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip
              contentStyle={{
                background: WOOD,
                border: `1px solid ${WOOD_LIGHT}`,
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 12,
                color: PARCHMENT,
              }}
              labelStyle={{ color: PARCHMENT }}
              itemStyle={{ color: GOLD }}
              formatter={(value) => [`${value}`, "check-in"]}
            />
            <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Tile>
  );
}

const WEEKDAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function weekdayLabel(dateStr: string) {
  const day = new Date(dateStr + "T00:00:00Z").getUTCDay();
  return WEEKDAYS[day];
}

const HEAT_LEVELS = [
  WOOD_LIGHT,
  "rgba(224,164,88,0.35)",
  "rgba(224,164,88,0.55)",
  "rgba(224,164,88,0.8)",
  GOLD,
];

function heatColor(count: number, max: number) {
  if (count === 0) return HEAT_LEVELS[0];
  const ratio = count / max;
  if (ratio <= 0.25) return HEAT_LEVELS[1];
  if (ratio <= 0.5) return HEAT_LEVELS[2];
  if (ratio <= 0.75) return HEAT_LEVELS[3];
  return HEAT_LEVELS[4];
}

function buildHeatmapWeeks(history: StreakHistoryPoint[]) {
  if (history.length === 0) return [];
  const firstWeekday = new Date(
    history[0].date + "T00:00:00Z",
  ).getUTCDay();
  const padded: (StreakHistoryPoint | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...history,
  ];
  const weeks: (StreakHistoryPoint | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

function StreakAnalysisTile({ history }: { history: StreakHistoryPoint[] }) {
  const weeks = buildHeatmapWeeks(history);
  const max = Math.max(1, ...history.map((h) => h.count));

  return (
    <Tile>
      <p style={{ margin: 0 }}>Son {history.length} günün aktivite haritası:</p>
      <div
        style={{
          display: "flex",
          gap: 2,
          marginTop: 12,
          overflowX: "auto",
        }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}: ${day.count} check-in` : undefined}
                style={{
                  width: 12,
                  height: 12,
                  background: day ? heatColor(day.count, max) : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 8,
          fontSize: 11,
          opacity: 0.8,
        }}
      >
        <span>az</span>
        {HEAT_LEVELS.map((c) => (
          <div key={c} style={{ width: 10, height: 10, background: c }} />
        ))}
        <span>çok</span>
      </div>
    </Tile>
  );
}

function CompareTile({
  thisWeek,
  lastWeek,
  thisWeekTotal,
  lastWeekTotal,
}: {
  thisWeek: StreakHistoryPoint[];
  lastWeek: StreakHistoryPoint[];
  thisWeekTotal: number;
  lastWeekTotal: number;
}) {
  const chartData = thisWeek.map((d, i) => ({
    weekday: weekdayLabel(d.date),
    thisWeek: d.count,
    lastWeek: lastWeek[i]?.count ?? 0,
  }));
  const delta = thisWeekTotal - lastWeekTotal;
  const deltaColor = delta >= 0 ? GOLD : MUTED;
  const deltaLabel =
    delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${Math.abs(delta)}` : "= 0";

  return (
    <Tile>
      <p style={{ margin: 0 }}>
        Bu hafta: <strong>{thisWeekTotal}</strong> · Geçen hafta:{" "}
        <strong>{lastWeekTotal}</strong>{" "}
        <span style={{ color: deltaColor }}>{deltaLabel}</span>
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 8,
          fontSize: 11,
          opacity: 0.8,
        }}
      >
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              background: GOLD,
              marginRight: 4,
            }}
          />
          Bu hafta
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              background: MUTED,
              marginRight: 4,
            }}
          />
          Geçen hafta
        </span>
      </div>
      <div style={{ height: 96, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="weekday"
              tick={{ fill: PARCHMENT, fontSize: 10 }}
              axisLine={{ stroke: WOOD_LIGHT }}
              tickLine={false}
            />
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip
              contentStyle={{
                background: WOOD,
                border: `1px solid ${WOOD_LIGHT}`,
                borderRadius: 0,
                fontFamily: "monospace",
                fontSize: 12,
                color: PARCHMENT,
              }}
              labelStyle={{ color: PARCHMENT }}
            />
            <Bar dataKey="lastWeek" fill={MUTED} radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="thisWeek" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Tile>
  );
}

function SuggestGoalTile({
  ok,
  title,
  reason,
  message,
}: {
  ok: boolean;
  title?: string;
  reason?: string;
  message?: string;
}) {
  return (
    <Tile>
      {ok ? (
        <>
          <p style={{ margin: 0 }}>
            Yeni quest önerisi: <strong>{title}</strong> ⚔️
          </p>
          <p style={{ margin: "6px 0 0", opacity: 0.85 }}>{reason}</p>
          <p style={{ margin: "8px 0 0", fontSize: 11, opacity: 0.6 }}>
            Eklemek için: &quot;{title} quest ekle&quot; de.
          </p>
        </>
      ) : (
        <p style={{ margin: 0 }}>{message ?? "Öneri üretilemedi."}</p>
      )}
    </Tile>
  );
}

function TalkToKnightTile({ reply }: { reply?: string }) {
  return (
    <Tile>
      <p style={{ margin: 0 }}>⚔️ {reply ?? "..."}</p>
    </Tile>
  );
}

function GoalCreatedTile({
  ok,
  goal,
  message,
}: {
  ok: boolean;
  goal?: { title: string };
  message?: string;
}) {
  return (
    <Tile>
      <p style={{ margin: 0 }}>
        {ok && goal ? (
          <>
            Yeni quest eklendi: <strong>{goal.title}</strong> ⚔️
          </>
        ) : (
          (message ?? "Quest eklenemedi.")
        )}
      </p>
    </Tile>
  );
}

function UnknownTile({
  message,
  suggestions,
}: {
  message?: string;
  suggestions: string[];
}) {
  return (
    <Tile>
      <p style={{ margin: 0 }}>
        {message ?? "Anlamadım kral, şunları sorabilirsin:"}
      </p>
      <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
        {suggestions.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </Tile>
  );
}

function CheckinTile({
  ok,
  goal,
  streak,
  message,
}: {
  ok: boolean;
  goal?: string;
  streak?: number;
  message?: string;
}) {
  return (
    <Tile>
      <p style={{ margin: 0 }}>
        {ok ? (
          <>
            <strong>{goal}</strong> tamamlandı! {streak} gündür yoldayız kral!
            ⚔️
          </>
        ) : (
          (message ?? "Check-in yapılamadı.")
        )}
      </p>
    </Tile>
  );
}
