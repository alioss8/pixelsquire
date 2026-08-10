import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { BarComparison } from "../data/BarComparison";
import { Heatmap } from "../data/Heatmap";
import { ProgressRing } from "../data/ProgressRing";
import { SparkLine } from "../data/SparkLine";
import type {
  CheckinData,
  CompareData,
  CreateGoalData,
  DayReviewData,
  IntentResult,
  StreakAnalysisData,
  StreakStatusData,
  SuggestGoalData,
  TalkToKnightData,
  UnknownData,
  WeeklyReviewData,
} from "./types";

const cardStyle: React.CSSProperties = { boxShadow: "var(--shadow-soft)" };

export function IntentTile({ result }: { result: IntentResult }) {
  const { intent, data } = result;

  if (intent === "STREAK_STATUS") {
    const d = data as StreakStatusData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>{d?.streak ?? 0} gündür yoldayız kral! ⚔️</p>
        <div style={{ marginTop: 14 }}>
          <SparkLine data={d?.history ?? []} />
        </div>
      </Card>
    );
  }

  if (intent === "CREATE_GOAL") {
    const d = data as CreateGoalData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>
          {d?.ok && d.goal ? (
            <>
              Yeni quest eklendi: <strong>{d.goal.title}</strong> ⚔️
            </>
          ) : (
            (d?.message ?? "Quest eklenemedi.")
          )}
        </p>
      </Card>
    );
  }

  if (intent === "CHECKIN") {
    const d = data as CheckinData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>
          {d?.ok ? (
            <>
              <strong>{d.goal}</strong> tamamlandı! {d.streak} gündür yoldayız kral! ⚔️
            </>
          ) : (
            (d?.message ?? "Check-in yapılamadı.")
          )}
        </p>
      </Card>
    );
  }

  if (intent === "DAY_REVIEW") {
    const d = data as DayReviewData | undefined;
    const completed = d?.completed ?? [];
    return (
      <Card variant="glass" style={cardStyle}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <ProgressRing value={completed.length} total={d?.total ?? 0} />
          <div>
            <p style={{ margin: 0, fontSize: 15 }}>{d?.date} özeti:</p>
            {completed.length === 0 ? (
              <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.75 }}>
                Hiç quest tamamlanmamış kral.
              </p>
            ) : (
              <ul style={{ margin: "6px 0 0", paddingLeft: 20, fontSize: 14 }}>
                {completed.map((g) => (
                  <li key={g.id}>{g.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (intent === "WEEKLY_REVIEW") {
    const d = data as WeeklyReviewData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>Son 7 gün:</p>
        <div style={{ marginTop: 14 }}>
          <SparkLine data={d?.history ?? []} height={64} />
        </div>
      </Card>
    );
  }

  if (intent === "STREAK_ANALYSIS") {
    const d = data as StreakAnalysisData | undefined;
    const history = d?.history ?? [];
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>Son {history.length} günün aktivite haritası:</p>
        <div style={{ marginTop: 14 }}>
          <Heatmap history={history} />
        </div>
      </Card>
    );
  }

  if (intent === "COMPARE") {
    const d = data as CompareData | undefined;
    const thisWeekTotal = d?.thisWeekTotal ?? 0;
    const lastWeekTotal = d?.lastWeekTotal ?? 0;
    const delta = thisWeekTotal - lastWeekTotal;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>
          Bu hafta: <strong>{thisWeekTotal}</strong> · Geçen hafta: <strong>{lastWeekTotal}</strong>{" "}
          <Badge tone={delta >= 0 ? "sage" : "slate"}>
            {delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${Math.abs(delta)}` : "= 0"}
          </Badge>
        </p>
        <div style={{ marginTop: 14 }}>
          <BarComparison thisWeek={d?.thisWeek ?? []} lastWeek={d?.lastWeek ?? []} />
        </div>
      </Card>
    );
  }

  if (intent === "SUGGEST_GOAL") {
    const d = data as SuggestGoalData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        {d?.ok ? (
          <>
            <p style={{ margin: 0, fontSize: 15 }}>
              Yeni quest önerisi: <strong>{d.title}</strong> ⚔️
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.85 }}>{d.reason}</p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 15 }}>{d?.message ?? "Öneri üretilemedi."}</p>
        )}
      </Card>
    );
  }

  if (intent === "TALK_TO_KNIGHT") {
    const d = data as TalkToKnightData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>⚔️ {d?.reply ?? "..."}</p>
      </Card>
    );
  }

  if (intent === "UNKNOWN") {
    const d = data as UnknownData | undefined;
    return (
      <Card variant="glass" style={cardStyle}>
        <p style={{ margin: 0, fontSize: 15 }}>
          {d?.message ?? "Anlamadım kral, şunları sorabilirsin:"}
        </p>
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, fontSize: 14 }}>
          {(d?.suggestions ?? []).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card variant="glass" style={cardStyle}>
      <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(data, null, 2)}</pre>
    </Card>
  );
}

export function mascotStateFor(loading: boolean, result: IntentResult | null) {
  if (loading) return "talk" as const;
  if (!result) return "idle" as const;

  if (result.intent === "UNKNOWN") return "sad" as const;

  if (result.intent === "COMPARE") {
    const d = result.data as CompareData | undefined;
    return (d?.thisWeekTotal ?? 0) >= (d?.lastWeekTotal ?? 0) ? ("happy" as const) : ("sad" as const);
  }

  if (["CREATE_GOAL", "CHECKIN", "SUGGEST_GOAL"].includes(result.intent)) {
    const d = result.data as { ok?: boolean } | undefined;
    return d?.ok === false ? ("sad" as const) : ("happy" as const);
  }

  if (["STREAK_STATUS", "DAY_REVIEW"].includes(result.intent)) return "happy" as const;

  return "talk" as const;
}
