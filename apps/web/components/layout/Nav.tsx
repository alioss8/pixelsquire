"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PushRegister } from "@/app/PushManager";

export function Nav({ user }: { user: { email: string; name: string | null } | null }) {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 40px",
        background: "var(--surface-glass)",
        backdropFilter: "blur(var(--blur-glass))",
        borderBottom: "1px solid var(--surface-glass-border)",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--gold-500)",
            fontSize: 19,
            fontWeight: 700,
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          PixelSquire
        </div>
        <div className="ps-nav-links" style={{ display: "flex", gap: 16 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              color: pathname === "/" ? "var(--gold-500)" : "var(--tan-400)",
            }}
          >
            Sohbet
          </Link>
          <Link
            href="/quests"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              color: pathname === "/quests" ? "var(--gold-500)" : "var(--tan-400)",
            }}
          >
            Questler
          </Link>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PushRegister />
        {user ? (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--tan-400)" }}>
            {user.name || user.email}
          </span>
        ) : (
          <a
            href="/api/v1/auth/google"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 12,
              padding: "8px 16px",
              background: "var(--accent-gold)",
              color: "var(--text-on-gold)",
              border: "none",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
            }}
          >
            Google ile Giriş
          </a>
        )}
      </div>
    </div>
  );
}
