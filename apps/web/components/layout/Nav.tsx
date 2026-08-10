"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PushRegister } from "@/app/PushManager";

export function Nav({ user }: { user: { email: string; name: string | null } | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = (href: string): React.CSSProperties => ({
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontSize: 13,
    textDecoration: "none",
    color: pathname === href ? "var(--gold-500)" : "var(--tan-400)",
  });

  const actions = user ? (
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
  );

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 40px",
          background: "var(--surface-glass)",
          backdropFilter: "blur(var(--blur-glass))",
          borderBottom: "1px solid var(--surface-glass-border)",
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
          <div className="ps-nav-desktop" style={{ gap: 16 }}>
            <Link href="/" style={linkStyle("/")}>
              Sohbet
            </Link>
            <Link href="/quests" style={linkStyle("/quests")}>
              Questler
            </Link>
          </div>
        </div>

        <div className="ps-nav-desktop" style={{ alignItems: "center", gap: 12 }}>
          <PushRegister />
          {actions}
        </div>

        <button
          className="ps-nav-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={menuOpen}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--tan-400)",
            padding: 6,
            cursor: "pointer",
            alignItems: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <path
                d="M5 5l12 12M17 5L5 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h16M3 11h16M3 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          className="ps-nav-hamburger"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            flexDirection: "column",
            gap: 14,
            padding: "20px 40px",
            background: "var(--surface-glass-strong)",
            backdropFilter: "blur(var(--blur-glass))",
            borderBottom: "1px solid var(--surface-glass-border)",
          }}
        >
          <Link href="/" style={linkStyle("/")} onClick={() => setMenuOpen(false)}>
            Sohbet
          </Link>
          <Link href="/quests" style={linkStyle("/quests")} onClick={() => setMenuOpen(false)}>
            Questler
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <PushRegister />
            {actions}
          </div>
        </div>
      )}
    </div>
  );
}
