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

export function QuestRow({
  quest,
  onToggle,
  onDeleteRequest,
  confirming,
  onConfirmDelete,
  onCancelDelete,
  justChecked,
}: {
  quest: Quest;
  onToggle: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  confirming: boolean;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  justChecked: boolean;
}) {
  return (
    <Card variant="glass" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => onToggle(quest.id)}
          aria-label="check-in"
          style={{
            width: 26,
            height: 26,
            flexShrink: 0,
            border: "2px solid var(--border-strong)",
            borderRadius: "var(--radius-sm)",
            background: quest.doneToday ? "var(--accent-gold)" : "transparent",
            color: "var(--text-on-gold)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {quest.doneToday ? "✓" : ""}
        </button>
        {justChecked && <MascotStage state="happy" frame={false} size={84} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 700 }}>{quest.title}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <Badge tone="gold">{quest.cadence === "DAILY" ? "GÜNLÜK" : quest.cadence === "WEEKLY" ? "HAFTALIK" : "TEK SEFERLİK"}</Badge>
            {quest.streak > 0 && <Badge tone="sage">⚔️ {quest.streak} gün</Badge>}
          </div>
        </div>
        <button
          onClick={() => onDeleteRequest(quest.id)}
          style={{ background: "none", border: "none", color: "var(--tan-500)", cursor: "pointer", fontSize: 13, padding: "4px 8px" }}
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
    </Card>
  );
}
