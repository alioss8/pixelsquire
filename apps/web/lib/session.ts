export type SessionSummary = {
  streak: number;
  activeGoals: number;
  user: { email: string; name: string | null } | null;
};

async function fetchSummary(): Promise<SessionSummary | null> {
  const res = await fetch("/api/v1/me/summary", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function ensureSession(): Promise<SessionSummary> {
  const existing = await fetchSummary();
  if (existing) return existing;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await fetch("/api/v1/devices/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ platform: "PWA", timezone }),
  });

  const summary = await fetchSummary();
  if (!summary) throw new Error("session bootstrap failed");
  return summary;
}
