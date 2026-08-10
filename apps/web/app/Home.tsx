"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { MascotStage } from "@/components/mascot/MascotStage";
import { Scene } from "@/components/mascot/Scene";
import { Nav } from "@/components/layout/Nav";
import { IntentTile, mascotStateFor } from "@/components/intent/IntentTile";
import type { IntentResult } from "@/components/intent/types";
import { ensureSession, type SessionSummary } from "@/lib/session";

const SUGGESTIONS = [
  { label: "Streak durumu", text: "kaç günlük streak'im var?" },
  { label: "Quest ekle", text: "yeni quest ekle: su iç" },
  { label: "Check-in yap", text: "su iç quest'ini tamamladım" },
  { label: "Günü özetle", text: "bugün ne yaptım" },
  { label: "Haftalık özet", text: "bu hafta nasıl geçti" },
  { label: "Aktivite haritası", text: "aktivite haritamı göster" },
  { label: "Haftaları karşılaştır", text: "bu hafta geçen haftaya göre nasıl" },
  { label: "Quest öner", text: "bana bir quest öner" },
  { label: "Şövalyeyle konuş", text: "naber" },
];

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--tan-400)", fontSize: 13, padding: "4px 2px" }}>
      <span>Şövalye düşünüyor</span>
      <span style={{ display: "flex", gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--tan-400)",
              animation: `ps-blink 1s ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </span>
      <style>{`@keyframes ps-blink{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );
}

export function Home() {
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<IntentResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureSession()
      .then(setSession)
      .catch(() => {});
  }, []);

  async function runCommand(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/v1/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: query }),
      });
      const data: IntentResult = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
      setText("");
    }
  }

  return (
    <Scene>
      <Nav user={session?.user ?? null} />
      <div
        style={{
          flex: 1,
          maxWidth: 640,
          width: "100%",
          margin: "0 auto",
          padding: "64px 32px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--gold-500)",
              fontSize: 34,
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.65)",
            }}
          >
            PixelSquire
          </div>
          <div
            style={{
              color: "var(--parchment-100)",
              fontSize: 16,
              maxWidth: 420,
              lineHeight: 1.5,
              textShadow: "0 1px 6px rgba(0,0,0,0.65)",
            }}
          >
            Pixel-art şövalye mascotlu motivasyon uygulaması
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--surface-glass)",
              backdropFilter: "blur(var(--blur-glass))",
              border: "1px solid var(--surface-glass-border)",
              borderRadius: "var(--radius-lg)",
              padding: "8px 12px 8px 8px",
            }}
          >
            <MascotStage state={mascotStateFor(loading, result)} frame={false} size={84} />
            <Input
              placeholder="Şövalyeye bir şey söyle..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ background: "transparent", border: "none", borderRadius: "var(--radius-lg)", fontSize: 15, padding: "12px 4px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") runCommand(text);
              }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 560 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setText(s.text);
                  runCommand(s.text);
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  padding: "8px 14px",
                  background: "var(--surface-glass)",
                  backdropFilter: "blur(var(--blur-glass))",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--surface-glass-border)",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <TypingIndicator />}
        {result && !loading && (
          <div style={{ width: "100%" }}>
            <IntentTile result={result} />
          </div>
        )}
      </div>
    </Scene>
  );
}
