"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const sizes: Record<NonNullable<ButtonProps["size"]>, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "var(--text-body-sm)" },
  md: { padding: "10px 18px", fontSize: "var(--text-body-md)" },
  lg: { padding: "13px 24px", fontSize: "var(--text-body-lg)" },
};

const variants: Record<
  NonNullable<ButtonProps["variant"]>,
  React.CSSProperties
> = {
  primary: { background: "var(--accent-gold)", color: "var(--text-on-gold)" },
  secondary: { background: "var(--state-neutral)", color: "var(--parchment-200)" },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "var(--stroke-hairline) solid var(--border-strong)",
    boxShadow: "none",
  },
  danger: { background: "var(--state-danger)", color: "var(--parchment-200)" },
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "var(--stroke-thick) solid #000",
    borderRadius: "var(--radius-none)",
    boxShadow: "var(--shadow-flat)",
    transition: "transform var(--duration-fast) var(--ease-standard)",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  return (
    <button
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translate(2px,2px)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translate(0,0)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0,0)";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
