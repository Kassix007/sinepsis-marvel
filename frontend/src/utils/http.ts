/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/http.ts
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  { timeoutMs = 25_000 } = {}
): Promise<{ ok: boolean; status: number; data?: T; errPayload?: any }> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any = null;
    try { parsed = await res.json(); } catch { /* body not JSON */ }
    return { ok: res.ok, status: res.status, data: res.ok ? parsed : undefined, errPayload: res.ok ? undefined : parsed };
  } finally {
    clearTimeout(t);
  }
}

export function humanizeError(status: number, errPayload: any, fallback: string) {
  // Prefer backend-provided detail; fall back to status buckets
  const detail = errPayload?.detail || errPayload?.error || errPayload?.message;
  if (detail) return detail as string;

  if (status === 0) return "Network error or server not reachable.";
  if (status === 400) return "Bad request. Please check your input and try again.";
  if (status === 413) return "File is too large. Try a smaller file.";
  if (status === 415) return "Unsupported file type.";
  if (status === 429) return "Rate limit hit. Please wait a moment.";
  if (status >= 500) return "Server error. Try again in a bit.";
  return fallback;
}

// Define your API base URL here or import it from your config
const API_BASE = "/api"; // Change this to your actual API base URL

// add this helper near fetchJson/humanizeError utilities
async function fetchDocumentText(documentId: string) {
  // Adjust this path to whatever your backend exposes (example route below).
  const { ok, status, data, errPayload } = await fetchJson<{ text: string }>(
    `${API_BASE}/documents/${documentId}/text`,
    { method: "GET" },
    { timeoutMs: 30_000 }
  );
  if (!ok) {
    throw new Error(humanizeError(status, errPayload, `Failed to fetch document text (${status})`));
  }
  return data!.text || "";
}