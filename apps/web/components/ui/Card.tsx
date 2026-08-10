import type { HTMLAttributes } from "react";

type CardProps = {
  variant?: "solid" | "glass";
} & HTMLAttributes<HTMLDivElement>;

const VARIANTS: Record<NonNullable<CardProps["variant"]>, React.CSSProperties> = {
  solid: {
    background: "var(--surface-card)",
    border: "var(--stroke-default) solid var(--surface-card-border)",
    backdropFilter: "none",
  },
  glass: {
    background: "var(--surface-glass)",
    border: "var(--stroke-hairline) solid var(--surface-glass-border)",
    backdropFilter: "blur(var(--blur-glass))",
  },
};

export function Card({ variant = "solid", style, children, ...rest }: CardProps) {
  return (
    <div
      style={{
        ...VARIANTS[variant],
        borderRadius: "var(--radius-none)",
        padding: "var(--space-5)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
