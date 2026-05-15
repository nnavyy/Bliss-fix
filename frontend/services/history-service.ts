export type ScanHistoryItem = {
  id: string;
  patientName: string;
  date: string;
  image: string;
  result: "Batu Ginjal" | "Normal";
  confidence: number;
  predictions: any[];
  doctorId?: string;
  scannedAt?: string;
};

const STORAGE_KEY = "ct-scan-history";

// ── LOCAL STORAGE ───────────────────────────────────────────────────────────

export function getHistoryLocal(): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ScanHistoryItem[]) : [];
}

export function saveHistoryLocal(item: ScanHistoryItem): void {
  const history = getHistoryLocal();
  history.unshift(item); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function deleteHistoryLocal(id: string): void {
  const history = getHistoryLocal().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Legacy aliases (backwards compatibility)
export const getHistory = getHistoryLocal;
export const saveHistory = saveHistoryLocal;

// ── API ─────────────────────────────────────────────────────────────────────

/**
 * Fetches scan history from /api/scans (with Bearer token).
 * Falls back to localStorage if no token is present or the request fails.
 */
export async function getHistoryFromAPI(): Promise<ScanHistoryItem[]> {
  if (typeof window === "undefined") return [];

  const token = localStorage.getItem("accessToken");
  if (!token) {
    // No auth → fall back to localStorage
    return getHistoryLocal();
  }

  try {
    const res = await fetch("/api/scans", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    return (data.scans ?? []) as ScanHistoryItem[];
  } catch {
    // Fall back to localStorage on network / API error
    return getHistoryLocal();
  }
}

/**
 * Deletes a scan via DELETE /api/scans/:id (with Bearer token).
 * Returns true if the server confirmed deletion, false otherwise.
 */
export async function deleteHistoryFromAPI(id: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const res = await fetch(`/api/scans/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.ok;
  } catch {
    return false;
  }
}
