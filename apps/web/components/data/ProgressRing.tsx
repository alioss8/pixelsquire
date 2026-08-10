export function ProgressRing({
  value = 0,
  total = 1,
  size = 64,
  label,
}: {
  value?: number;
  total?: number;
  size?: number;
  label?: string;
}) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--surface-card-border)"
        strokeWidth={8}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent-gold)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - ratio)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize={size * 0.2}
        fontFamily="var(--font-mono)"
        fill="var(--text-primary)"
      >
        {label ?? `${value}/${total}`}
      </text>
    </svg>
  );
}
