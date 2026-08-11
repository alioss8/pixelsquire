"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MascotStage } from "@/components/mascot/MascotStage";
import { Nav } from "@/components/layout/Nav";
import { QuestRow, type Quest } from "@/components/layout/QuestRow";
import { Scene } from "@/components/mascot/Scene";
import { ensureSession, fetchSummary, type SessionSummary } from "@/lib/session";

export function Quests() {
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [justCheckedId, setJustCheckedId] = useState<string | null>(null);
  const [xpGainedId, setXpGainedId] = useState<{ id: string; amount: number } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function flashError(message: string) {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }

  async function toggle(id: string) {
    const quest = quests?.find((q) => q.id === id);
    if (!quest) return;
    const wasDone = quest.doneToday;
    try {
      const res = await fetch(`/api/v1/goals/${id}/checkin`, {
        method: wasDone ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("checkin failed");
      const data = await res.json();

      if (!wasDone) {
        setJustCheckedId(id);
        setTimeout(() => setJustCheckedId(null), 1500);

        if (data.xpGained > 0) {
          setXpGainedId({ id, amount: data.xpGained });
          setTimeout(() => setXpGainedId(null), 1400);
        }

        if (session && typeof data.level === "number" && data.level > session.level) {
          setLevelUp(data.level);
          setTimeout(() => setLevelUp(null), 2600);
        }
      }

      fetchSummary().then((s) => s && setSession(s));
      await loadQuests();
    } catch {
      flashError("Bir şeyler ters gitti kral, tekrar dener misin?");
    }
  }

  async function changeCadence(id: string, cadence: string) {
    setQuests((prev) => prev?.map((q) => (q.id === id ? { ...q, cadence } : q)) ?? prev);
    try {
      const res = await fetch(`/api/v1/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cadence }),
      });
      if (!res.ok) throw new Error("cadence update failed");
    } catch {
      flashError("Tekrar sıklığı güncellenemedi kral, tekrar dener misin?");
      await loadQuests();
    }
  }

  async function confirmDelete(id: string) {
    try {
      const res = await fetch(`/api/v1/goals/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("delete failed");
      setDeletingId(null);
      await loadQuests();
    } catch {
      flashError("Quest silinemedi kral, tekrar dener misin?");
    }
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

        {session?.streakAtRisk && (
          <Card variant="glass" style={{ borderColor: "var(--state-danger)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: "var(--parchment-100)" }}>
              {session.streak} günlük serin tehlikede kral! Bugün henüz hiç quest tamamlamadın.
            </p>
          </Card>
        )}

        {error && (
          <Card variant="glass" style={{ borderColor: "var(--state-danger)" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--parchment-100)" }}>{error}</p>
          </Card>
        )}

        {levelUp && (
          <Card
            variant="glass"
            style={{ display: "flex", alignItems: "center", gap: 12, borderColor: "var(--accent-gold)" }}
          >
            <MascotStage state="happy" frame={false} size={56} />
            <p style={{ margin: 0, fontSize: 14, color: "var(--gold-400)", fontWeight: 700 }}>
              Seviye atladın! Şimdi Lv. {levelUp} kral ⚔️
            </p>
          </Card>
        )}

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
              xpGained={xpGainedId?.id === q.id ? xpGainedId.amount : null}
              onCadenceChange={changeCadence}
            />
          ))
        )}
      </div>
    </Scene>
  );
}
