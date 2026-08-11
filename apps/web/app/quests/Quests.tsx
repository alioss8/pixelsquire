"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MascotStage } from "@/components/mascot/MascotStage";
import { Nav } from "@/components/layout/Nav";
import { QuestRow, type Quest } from "@/components/layout/QuestRow";
import { Scene } from "@/components/mascot/Scene";
import { ensureSession, type SessionSummary } from "@/lib/session";

export function Quests() {
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [justCheckedId, setJustCheckedId] = useState<string | null>(null);

  async function loadQuests() {
    const res = await fetch("/api/v1/goals", { credentials: "include" });
    if (!res.ok) return;
    setQuests(await res.json());
  }

  useEffect(() => {
    ensureSession()
      .then(setSession)
      .catch(() => {})
      .finally(loadQuests);
  }, []);

  async function toggle(id: string) {
    const quest = quests?.find((q) => q.id === id);
    if (!quest) return;
    await fetch(`/api/v1/goals/${id}/checkin`, {
      method: quest.doneToday ? "DELETE" : "POST",
      credentials: "include",
    });
    if (!quest.doneToday) {
      setJustCheckedId(id);
      setTimeout(() => setJustCheckedId(null), 1500);
    }
    await loadQuests();
  }

  async function confirmDelete(id: string) {
    await fetch(`/api/v1/goals/${id}`, { method: "DELETE", credentials: "include" });
    setDeletingId(null);
    await loadQuests();
  }

  return (
    <Scene>
      <Nav
        user={session?.user ?? null}
        level={session?.level}
        xpIntoLevel={session?.xpIntoLevel}
        xpForNextLevel={session?.xpForNextLevel}
      />
      <div
        style={{
          flex: 1,
          maxWidth: 560,
          width: "100%",
          margin: "0 auto",
          padding: "32px 32px 96px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--gold-500)", fontSize: 22, margin: 0 }}>
            Questlerin
          </h1>
        </div>

        {quests === null ? (
          <p style={{ color: "var(--tan-400)", fontSize: 14 }}>Yükleniyor...</p>
        ) : quests.length === 0 ? (
          <Card
            variant="glass"
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--tan-400)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MascotStage state="sad" frame={false} size={72} />
            <p style={{ margin: 0, fontSize: 15 }}>Hiç quest yok kral.</p>
            <p style={{ margin: "6px 0 0", fontSize: 13 }}>Sohbet ekranından şövalyeye bir quest söyle, buraya düşsün.</p>
            <div style={{ marginTop: 16 }}>
              <Link href="/">
                <Button variant="primary" size="sm">
                  Quest Ekle
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          quests.map((q) => (
            <QuestRow
              key={q.id}
              quest={q}
              onToggle={toggle}
              onDeleteRequest={setDeletingId}
              confirming={deletingId === q.id}
              onConfirmDelete={confirmDelete}
              onCancelDelete={() => setDeletingId(null)}
              justChecked={justCheckedId === q.id}
            />
          ))
        )}
      </div>
    </Scene>
  );
}
