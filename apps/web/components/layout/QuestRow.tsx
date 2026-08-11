"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MascotStage } from "@/components/mascot/MascotStage";

export type Quest = {
  id: string;
  title: string;
  cadence: string;
  streak: number;
  doneToday: boolean;
};

const CADENCE_LABEL: Record<string, string> = {
  DAILY: "GÜNLÜK",
  WEEKLY: "HAFTALIK",
  ONCE: "TEK SEFERLİK",
};

export function QuestRow({
  quest,
  onToggle,
  onDeleteRequest,
  confirming,
  onConfirmDelete,
  onCancelDelete,
  justChecked,
  xpGained,
  onCadenceChange,
}: {
  quest: Quest;
  onToggle: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  confirming: boolean;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  justChecked: boolean;
  xpGained?: number | null;
  onCadenceChange: (id: string, cadence: string) => void;
}) {
  return (
    <Card variant="glass" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => onToggle(quest.id)}
            aria-label="check-in"
            style={{
              width: 40,
              height: 40,
              border: "2px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              background: quest.doneToday ? "var(--accent-gold)" : "transparent",
              color: "var(--text-on-gold)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {quest.doneToday ? "✓" : ""}
          </button>
          {xpGained ? (
            <span
              style={{
                position: "absolute",
                top: -10,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--font-body)",
                fontWeight: 800,
                fontSize: 12,
                color: "var(--gold-400)",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                whiteSpace: "nowrap",
                animation: "ps-xp-float 1.4s ease-out forwards",
                pointerEvents: "none",
              }}
            >
              +{xpGained} XP
            </span>
          ) : null}
        </div>
        {justChecked && <MascotStage state="happy" frame={false} size={84} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 700 }}>{quest.title}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
            <select
              value={quest.cadence}
              onChange={(e) => onCadenceChange(quest.id, e.target.value)}
              aria-label="tekrar sıklığı"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-caption)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
                padding: "4px 8px",
                border: "var(--stroke-hairline) solid var(--border-strong)",
                borderRadius: "var(--radius-none)",
                background: "var(--surface-inset)",
                color: "var(--accent-gold)",
                cursor: "pointer",
              }}
            >
              {Object.entries(CADENCE_LABEL).map(([value, label]) => (
                <option key={value} value={value} style={{ background: "var(--wood-900)" }}>
                  {label}
                </option>
              ))}
            </select>
            {quest.streak > 0 && <Badge tone="sage">⚔️ {quest.streak} gün</Badge>}
          </div>
        </div>
        <button
          onClick={() => onDeleteRequest(quest.id)}
          style={{
            background: "none",
            border: "none",
            color: "var(--tan-500)",
            cursor: "pointer",
            fontSize: 13,
            padding: "10px 12px",
            minHeight: 40,
          }}
        >
          Sil
        </button>
      </div>
      {confirming && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid var(--surface-glass-border)" }}>
          <span style={{ fontSize: 13, color: "var(--parchment-100)", flex: 1 }}>Bu questi silmek istediğine emin misin?</span>
          <Button variant="danger" size="sm" onClick={() => onConfirmDelete(quest.id)}>
            Sil
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancelDelete}>
            Vazgeç
          </Button>
        </div>
      )}
      <style>{`@keyframes ps-xp-float{0%{opacity:0;transform:translate(-50%,4px);}20%{opacity:1;transform:translate(-50%,0);}80%{opacity:1;}100%{opacity:0;transform:translate(-50%,-14px);}}`}</style>
    </Card>
  );
}
