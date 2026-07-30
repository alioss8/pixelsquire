const API_BASE = "http://localhost:3000/api/v1";

async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("token");
  return (result.token as string) ?? null;
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json();
}

export const api = {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body: unknown) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
};
