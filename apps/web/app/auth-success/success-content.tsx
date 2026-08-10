"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MascotStage } from "@/components/mascot/MascotStage";
import { Scene } from "@/components/mascot/Scene";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Scene>
      <div
        style={{
          flex: 1,
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <MascotStage state="happy" frame={false} size={120} />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--gold-500)",
            fontSize: 30,
            margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.65)",
          }}
        >
          ⚔️ Giriş başarılı!
        </h1>
        {email && (
          <p style={{ color: "var(--parchment-100)", fontSize: 16, margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.65)" }}>
            Google hesabın bağlandı: <strong>{email}</strong>
          </p>
        )}
        <p style={{ color: "var(--tan-400)", fontSize: 14, margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.65)" }}>
          Uzantıya dönülüyor...
        </p>
        <Link
          href="/"
          style={{ marginTop: 12, color: "var(--tan-400)", fontSize: 13, textDecoration: "underline" }}
        >
          ← Ana sayfaya dön
        </Link>
      </div>
    </Scene>
  );
}
