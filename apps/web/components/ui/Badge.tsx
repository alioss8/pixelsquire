import type { HTMLAttributes } from "react";

type BadgeProps = {
  tone?: "gold" | "sage" | "slate";
} & HTMLAttributes<HTMLSpanElement>;

const TONES: Record<
  NonNullable<BadgeProps["tone"]>,
  { background: string; color: string; border: string }
> = {
  gold: {
    background: "var(--surface-inset)",
    color: "var(--accent-gold)",
    border: "var(--border-strong)",
  },
  sage: {
    background: "rgba(122,155,94,0.12)",
    color: "var(--state-success)",
    border: "var(--state-success)",
  },
  slate: {
    background: "rgba(86,108,134,0.15)",
    color: "var(--state-neutral)",
    border: "var(--state-neutral)",
  },
};

export function Badge({ tone = "gold", style, children, ...rest }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: "var(--text-caption)",
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        padding: "4px 10px",
        border: `var(--stroke-hairline) solid ${t.border}`,
        borderRadius: "var(--radius-none)",
        background: t.background,
        color: t.color,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
