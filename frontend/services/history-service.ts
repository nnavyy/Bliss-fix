export type ScanHistoryItem = {
  id: string;
  patientName: string;
  date: string;
  image: string;
  result: "Batu Ginjal" | "Normal";
  confidence: number;
  predictions: any[];
  doctorId?: string;
};

const STORAGE_KEY = "ct-scan-history";

export function getHistory(): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveHistory(item: ScanHistoryItem) {
  const history = getHistory();
  history.unshift(item); // terbaru di atas
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
