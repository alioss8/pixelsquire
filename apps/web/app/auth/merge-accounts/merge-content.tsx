"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MascotStage } from "@/components/mascot/MascotStage";
import { Scene } from "@/components/mascot/Scene";

type AccountSummary = {
  goalCount: number;
  streak: number;
  email: string | null;
  name: string | null;
};

type Preview = { google: AccountSummary; anon: AccountSummary };

export function MergeContent() {
  const searchParams = useSearchParams();
  const googleUserId = searchParams.get("googleUserId") || "";
  const anonUserId = searchParams.get("anonUserId") || "";
  const deviceToken = searchParams.get("deviceToken") || "";

  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreview() {
      if (!googleUserId || !anonUserId || !deviceToken) {
        setError("Bağlantı eksik görünüyor, uzantıdan tekrar giriş dener misin?");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/v1/auth/merge-preview?googleUserId=${googleUserId}&anonUserId=${anonUserId}&deviceToken=${deviceToken}`,
        );
        if (!res.ok) throw new Error("preview failed");
        setPreview(await res.json());
      } catch {
        setError("Hesap bilgileri yüklenemedi kral, bir daha dener misin?");
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, [googleUserId, anonUserId, deviceToken]);

  async function handleMerge(keepUserId: string) {
    setMerging(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keepUserId,
          deleteUserId: keepUserId === googleUserId ? anonUserId : googleUserId,
          deviceToken,
        }),
      });
      if (!res.ok) throw new Error("merge failed");
      window.location.href = `/auth-success?deviceToken=${deviceToken}`;
    } catch {
      setError("Birleştirme başarısız oldu kral, bir daha dener misin?");
      setMerging(false);
    }
  }

  const choiceCardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
  };

  return (
    <Scene>
      <div
        style={{
          flex: 1,
          maxWidth: 520,
          width: "100%",
          margin: "0 auto",
          padding: "64px 32px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          boxSizing: "border-box",
        }}
      >
        <MascotStage state={loading ? "talk" : "idle"} frame={false} size={100} />
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--gold-500)",
              fontSize: 26,
              margin: 0,
              textShadow: "0 2px 8px rgba(0,0,0,0.65)",
            }}
          >
            İki hesap buldum kral
          </h1>
          <p
            style={{
              color: "var(--parchment-100)",
              fontSize: 14,
              margin: "10px 0 0",
              textShadow: "0 1px 6px rgba(0,0,0,0.65)",
            }}
          >
            Bu cihazda kayıtlı bir ilerleme var, bir de Google hesabınla ilişkili başka bir
            ilerleme. Hangisini tutmak istiyorsun? Diğeri tamamen silinecek, bu geri alınamaz.
          </p>
        </div>

        {loading && (
          <p style={{ color: "var(--tan-400)", fontSize: 14 }}>Hesaplar karşılaştırılıyor...</p>
        )}

        {error && (
          <Card variant="glass" style={{ borderColor: "var(--state-danger)" }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--parchment-100)" }}>{error}</p>
          </Card>
        )}

        {preview && !loading && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <Card variant="glass" style={choiceCardStyle}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gold-500)" }}>
                🔑 Google hesabı{preview.google.email ? ` — ${preview.google.email}` : ""}
              </div>
              <div style={{ fontSize: 13, color: "var(--tan-400)" }}>
                {preview.google.goalCount} quest · {preview.google.streak} günlük streak
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={merging}
                onClick={() => handleMerge(googleUserId)}
              >
                Bunu tut
              </Button>
            </Card>

            <Card variant="glass" style={choiceCardStyle}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--parchment-100)" }}>
                📱 Bu cihazdaki ilerleme
              </div>
              <div style={{ fontSize: 13, color: "var(--tan-400)" }}>
                {preview.anon.goalCount} quest · {preview.anon.streak} günlük streak
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={merging}
                onClick={() => handleMerge(anonUserId)}
              >
                Bunu tut
              </Button>
            </Card>
          </div>
        )}
      </div>
    </Scene>
  );
}
