export function ChartTooltip({
  xPercent,
  yPercent,
  children,
}: {
  xPercent: number;
  yPercent: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: "translate(-50%, -100%)",
        marginTop: -10,
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
        borderRadius: "var(--radius-none)",
        padding: "4px 8px",
        fontSize: 11,
        fontFamily: "var(--font-body)",
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 2,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {children}
    </div>
  );
}
